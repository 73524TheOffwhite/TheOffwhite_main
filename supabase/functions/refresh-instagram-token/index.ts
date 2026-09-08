import { createServiceClient } from "../_shared/database.ts";
import { corsHeaders, json } from "../_shared/http.ts";

type TokenRow = {
  id: string;
  label: string;
  access_token: string;
  token_type: "facebook_user" | "instagram_user" | "page";
  instagram_user_id: string | null;
  username: string | null;
  expires_at: string | null;
  last_refreshed_at: string | null;
};

type UpsertBody = {
  action?: "refresh" | "upsert" | "status";
  access_token?: string;
  instagram_user_id?: string;
  username?: string;
  token_type?: "facebook_user" | "instagram_user" | "page";
  expires_in?: number;
  label?: string;
  /** Force refresh even if more than 10 days remain */
  force?: boolean;
};

const FB_GRAPH = "https://graph.facebook.com/v21.0";
const IG_GRAPH = "https://graph.instagram.com";
const REFRESH_WITHIN_MS = 10 * 24 * 60 * 60 * 1000;
const DEFAULT_LONG_LIVED_SECONDS = 60 * 24 * 60 * 60;

function isAuthorized(request: Request): boolean {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const cronSecret = Deno.env.get("INSTAGRAM_CRON_SECRET")?.trim();
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  return Boolean(
    (cronSecret && token === cronSecret) || (serviceRole && token === serviceRole),
  );
}

function detectTokenType(
  accessToken: string,
  explicit?: UpsertBody["token_type"],
): TokenRow["token_type"] {
  if (explicit) return explicit;
  if (accessToken.startsWith("IG")) return "instagram_user";
  return "facebook_user";
}

function expiresAtFromSeconds(expiresIn: number | undefined): string {
  const seconds = expiresIn && expiresIn > 0 ? expiresIn : DEFAULT_LONG_LIVED_SECONDS;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function needsRefresh(expiresAt: string | null | undefined, force?: boolean): boolean {
  if (force) return true;
  if (!expiresAt) return true;
  const msLeft = new Date(expiresAt).getTime() - Date.now();
  return msLeft <= REFRESH_WITHIN_MS;
}

async function exchangeFacebookLongLived(shortOrLongToken: string): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const appId = Deno.env.get("FACEBOOK_APP_ID")?.trim();
  const appSecret = Deno.env.get("FACEBOOK_APP_SECRET")?.trim();
  if (!appId || !appSecret) {
    throw new Error("FACEBOOK_APP_ID and FACEBOOK_APP_SECRET secrets are required to exchange/refresh Facebook tokens.");
  }

  const url =
    `${FB_GRAPH}/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${encodeURIComponent(appId)}` +
    `&client_secret=${encodeURIComponent(appSecret)}` +
    `&fb_exchange_token=${encodeURIComponent(shortOrLongToken)}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message || "Facebook token exchange failed.");
  }

  return { access_token: data.access_token, expires_in: data.expires_in };
}

async function refreshInstagramLoginToken(longLivedToken: string): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const url =
    `${IG_GRAPH}/refresh_access_token` +
    `?grant_type=ig_refresh_token` +
    `&access_token=${encodeURIComponent(longLivedToken)}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!res.ok || !data.access_token) {
    throw new Error(data.error?.message || "Instagram token refresh failed.");
  }

  return { access_token: data.access_token, expires_in: data.expires_in };
}

async function resolveIgUserId(
  accessToken: string,
  tokenType: TokenRow["token_type"],
  existing?: string | null,
): Promise<{ instagram_user_id: string | null; username: string | null }> {
  if (existing) {
    return { instagram_user_id: existing, username: null };
  }

  try {
    if (tokenType === "instagram_user") {
      const res = await fetch(
        `${IG_GRAPH}/me?fields=id,username&access_token=${encodeURIComponent(accessToken)}`,
      );
      const data = (await res.json()) as { id?: string; username?: string };
      if (res.ok && data.id) {
        return { instagram_user_id: data.id, username: data.username || null };
      }
      return { instagram_user_id: null, username: null };
    }

    const res = await fetch(
      `${FB_GRAPH}/me/accounts?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(accessToken)}`,
    );
    const data = (await res.json()) as {
      data?: Array<{
        instagram_business_account?: { id?: string; username?: string };
      }>;
    };
    const ig = data.data?.find((p) => p.instagram_business_account?.id)?.instagram_business_account;
    return {
      instagram_user_id: ig?.id || null,
      username: ig?.username || null,
    };
  } catch {
    return { instagram_user_id: null, username: null };
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return json(request, { error: "Method not allowed." }, 405);
  }

  if (!isAuthorized(request)) {
    return json(request, { error: "Unauthorized." }, 401);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as UpsertBody;
    const action = body.action || "refresh";
    const label = (body.label || "default").trim() || "default";
    const supabase = createServiceClient();

    if (action === "status") {
      const { data, error } = await supabase
        .from("instagram_tokens")
        .select(
          "id,label,token_type,instagram_user_id,username,expires_at,last_refreshed_at,updated_at",
        )
        .eq("label", label)
        .maybeSingle();
      if (error) throw error;
      return json(request, {
        ok: true,
        configured: Boolean(data),
        token: data,
      });
    }

    if (action === "upsert") {
      const rawToken = body.access_token?.trim();
      if (!rawToken) {
        return json(request, { error: "access_token is required for upsert." }, 400);
      }

      let tokenType = detectTokenType(rawToken, body.token_type);
      let accessToken = rawToken;
      let expiresIn = body.expires_in;

      // Exchange short-lived Facebook user tokens to ~60-day long-lived when app secrets exist.
      if (tokenType === "facebook_user" && Deno.env.get("FACEBOOK_APP_ID") && Deno.env.get("FACEBOOK_APP_SECRET")) {
        try {
          const exchanged = await exchangeFacebookLongLived(rawToken);
          accessToken = exchanged.access_token;
          expiresIn = exchanged.expires_in ?? expiresIn;
        } catch (exchangeError) {
          // Keep the provided token if exchange fails (e.g. already long-lived / wrong type).
          console.error("[refresh-instagram-token] exchange:", exchangeError);
        }
      }

      const resolved = await resolveIgUserId(
        accessToken,
        tokenType,
        body.instagram_user_id?.trim() || null,
      );

      const row = {
        label,
        access_token: accessToken,
        token_type: tokenType,
        instagram_user_id: resolved.instagram_user_id || body.instagram_user_id?.trim() || null,
        username: body.username?.trim() || resolved.username || null,
        expires_at: expiresAtFromSeconds(expiresIn),
        last_refreshed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("instagram_tokens")
        .upsert(row, { onConflict: "label" })
        .select(
          "id,label,token_type,instagram_user_id,username,expires_at,last_refreshed_at,updated_at",
        )
        .single();

      if (error) throw error;

      return json(request, {
        ok: true,
        action: "upsert",
        token: data,
        message: "Token saved. Feed will use this row when SUPABASE_SERVICE_ROLE_KEY is set on the site server.",
      });
    }

    // action === "refresh"
    const { data: existing, error: readError } = await supabase
      .from("instagram_tokens")
      .select("*")
      .eq("label", label)
      .maybeSingle();

    if (readError) throw readError;
    if (!existing) {
      return json(request, {
        ok: false,
        skipped: true,
        reason: "No token row yet. Call action=upsert after you generate a fresh Meta token.",
      }, 404);
    }

    const current = existing as TokenRow;
    if (!needsRefresh(current.expires_at, body.force)) {
      return json(request, {
        ok: true,
        refreshed: false,
        skipped: true,
        reason: "Token still has more than 10 days left.",
        expires_at: current.expires_at,
      });
    }

    let nextToken = current.access_token;
    let expiresIn: number | undefined;

    if (current.token_type === "instagram_user") {
      const refreshed = await refreshInstagramLoginToken(current.access_token);
      nextToken = refreshed.access_token;
      expiresIn = refreshed.expires_in;
    } else if (current.token_type === "page") {
      // Page tokens from long-lived user tokens often do not expire; re-check via exchange of stored user flow is N/A.
      return json(request, {
        ok: true,
        refreshed: false,
        skipped: true,
        reason: "Page tokens are not auto-refreshed here. Upsert a fresh page token if needed.",
        expires_at: current.expires_at,
      });
    } else {
      const refreshed = await exchangeFacebookLongLived(current.access_token);
      nextToken = refreshed.access_token;
      expiresIn = refreshed.expires_in;
    }

    const { data: updated, error: updateError } = await supabase
      .from("instagram_tokens")
      .update({
        access_token: nextToken,
        expires_at: expiresAtFromSeconds(expiresIn),
        last_refreshed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select(
        "id,label,token_type,instagram_user_id,username,expires_at,last_refreshed_at,updated_at",
      )
      .single();

    if (updateError) throw updateError;

    return json(request, {
      ok: true,
      refreshed: true,
      token: updated,
    });
  } catch (error) {
    console.error("[refresh-instagram-token]", error);
    return json(
      request,
      { error: error instanceof Error ? error.message : "Token refresh failed." },
      500,
    );
  }
});
