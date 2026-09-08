import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function enforceRateLimit(
  supabase: SupabaseClient,
  ip: string,
  formType: "reservation" | "enquiry",
) {
  const ipHash = await sha256(ip);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("submission_rate_limits")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("form_type", formType)
    .gte("submitted_at", since);

  if (error) throw error;
  if ((count || 0) >= 5) {
    throw new Error("RATE_LIMITED");
  }

  const { error: insertError } = await supabase
    .from("submission_rate_limits")
    .insert({ ip_hash: ipHash, form_type: formType });

  if (insertError) throw insertError;
}
