import { createServiceClient } from "../_shared/database.ts";
import { sendNotification } from "../_shared/email.ts";
import { corsHeaders, getClientIp, json } from "../_shared/http.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

type ReservationRequest = {
  reservationDate?: string;
  reservationTime?: string;
  guests?: number;
  location?: "level4" | "level5";
  occasion?: string;
  seatingPreference?: string;
  name?: string;
  phone?: string;
  email?: string;
  specialRequest?: string;
  source?: "events_full" | "home_mini";
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") return json(request, { error: "Method not allowed." }, 405);

  try {
    const body = (await request.json()) as ReservationRequest;
    const phone = (body.phone || "").replace(/\D/g, "");
    const guests = Number(body.guests);
    const today = new Date().toISOString().slice(0, 10);

    if (
      !body.name?.trim() ||
      phone.length < 10 ||
      !body.reservationDate ||
      body.reservationDate < today ||
      !body.reservationTime ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 12 ||
      !["level4", "level5"].includes(body.location || "") ||
      !["events_full", "home_mini"].includes(body.source || "")
    ) {
      return json(request, { error: "Please provide valid reservation details." }, 400);
    }

    const supabase = createServiceClient();
    const ip = getClientIp(request);
    await enforceRateLimit(supabase, ip, "reservation");

    const { data: blackout, error: blackoutError } = await supabase
      .from("blackout_dates")
      .select("id")
      .eq("blackout_date", body.reservationDate)
      .eq("is_active", true)
      .in("location", ["all", body.location])
      .limit(1)
      .maybeSingle();

    if (blackoutError) throw blackoutError;
    if (blackout) {
      return json(request, { error: "Reservations are unavailable for the selected date." }, 409);
    }

    const { data, error } = await supabase
      .from("reservations")
      .insert({
        reservation_date: body.reservationDate,
        reservation_time: body.reservationTime,
        guests,
        location: body.location,
        occasion: body.occasion?.trim() || null,
        seating_preference: body.seatingPreference?.trim() || null,
        name: body.name.trim(),
        phone,
        email: body.email?.trim() || null,
        special_request: body.specialRequest?.trim() || null,
        source: body.source,
        ip_address: ip === "unknown" ? null : ip,
        user_agent: request.headers.get("user-agent"),
      })
      .select("reference_code")
      .single();

    if (error) throw error;

    const recipient = Deno.env.get("RESERVATIONS_EMAIL") || "";
    await sendNotification({
      to: recipient,
      subject: `New reservation ${data.reference_code}`,
      text: [
        `Reference: ${data.reference_code}`,
        `Name: ${body.name.trim()}`,
        `Phone: ${phone}`,
        `Date: ${body.reservationDate}`,
        `Time: ${body.reservationTime}`,
        `Guests: ${guests}`,
        `Location: ${body.location}`,
        `Occasion: ${body.occasion || "—"}`,
        `Request: ${body.specialRequest || body.seatingPreference || "—"}`,
      ].join("\n"),
    });

    return json(request, {
      referenceCode: data.reference_code,
      message: "Your reservation request has been received.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return json(request, { error: "Too many requests. Please try again in one hour." }, 429);
    }
    console.error(error);
    return json(request, { error: "Unable to submit the reservation right now." }, 500);
  }
});
