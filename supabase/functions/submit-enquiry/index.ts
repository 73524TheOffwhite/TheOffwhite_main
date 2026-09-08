import { createServiceClient } from "../_shared/database.ts";
import { sendNotification } from "../_shared/email.ts";
import { corsHeaders, getClientIp, json } from "../_shared/http.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

type EnquiryRequest = {
  type?: "private_event" | "level5_booking";
  source?: "contact" | "level5";
  name?: string;
  email?: string;
  phone?: string;
  occasion?: string;
  eventDate?: string;
  eventTime?: string;
  guests?: string;
  message?: string;
};

function normalizeDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    const body = (await request.json()) as EnquiryRequest;
    const email = body.email?.trim().toLowerCase() || "";
    const eventDate = normalizeDate(body.eventDate || "");

    if (
      !body.name?.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !body.occasion?.trim() ||
      !eventDate ||
      !body.guests?.trim() ||
      !["private_event", "level5_booking"].includes(body.type || "") ||
      !["contact", "level5"].includes(body.source || "")
    ) {
      return json(request, { error: "Please provide valid enquiry details." }, 400);
    }

    const supabase = createServiceClient();
    const ip = getClientIp(request);
    await enforceRateLimit(supabase, ip, "enquiry");

    const { data, error } = await supabase
      .from("enquiries")
      .insert({
        type: body.type,
        source: body.source,
        name: body.name.trim(),
        email,
        phone: body.phone?.replace(/\D/g, "") || null,
        occasion: body.occasion.trim(),
        event_date: eventDate,
        event_time: body.eventTime?.trim() || null,
        guests: body.guests.trim(),
        message: body.message?.trim() || null,
        ip_address: ip === "unknown" ? null : ip,
        user_agent: request.headers.get("user-agent"),
      })
      .select("reference_code")
      .single();

    if (error) throw error;

    const recipient = Deno.env.get("EVENTS_EMAIL") || "";
    await sendNotification({
      to: recipient,
      subject: `New event enquiry ${data.reference_code}`,
      text: [
        `Reference: ${data.reference_code}`,
        `Name: ${body.name.trim()}`,
        `Email: ${email}`,
        `Phone: ${body.phone || "—"}`,
        `Occasion: ${body.occasion.trim()}`,
        `Date: ${eventDate}`,
        `Time: ${body.eventTime || "—"}`,
        `Guests: ${body.guests.trim()}`,
        `Message: ${body.message || "—"}`,
      ].join("\n"),
    });

    return json(request, {
      referenceCode: data.reference_code,
      message: "Your enquiry has been received.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return json(request, { error: "Too many requests. Please try again in one hour." }, 429);
    }
    console.error(error);
    return json(request, { error: "Unable to submit the enquiry right now." }, 500);
  }
});
