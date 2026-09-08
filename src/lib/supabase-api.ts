const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;



type ReservationPayload = {

  reservationDate: string;

  reservationTime: string;

  guests: number;

  location: "level4" | "level5";

  occasion?: string;

  seatingPreference?: string;

  name: string;

  phone: string;

  email?: string;

  specialRequest?: string;

  source: "events_full" | "home_mini";

};



type EnquiryPayload = {

  type: "private_event" | "level5_booking";

  source: "contact" | "level5";

  name: string;

  email: string;

  phone?: string;

  occasion: string;

  eventDate: string;

  eventTime?: string;

  guests: string;

  message?: string;

};



type SubmissionResponse = {

  referenceCode: string;

  message: string;

};



function requireSupabaseConfig() {

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {

    throw new Error(

      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",

    );

  }



  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };

}



function localTodayIso() {

  const now = new Date();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;

}



function normalizeDate(value: string) {

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";

}



function parseApiError(result: unknown, fallback: string) {

  if (!result || typeof result !== "object") return fallback;



  const row = result as Record<string, unknown>;

  if (typeof row.message === "string" && row.message.trim()) return row.message;

  if (typeof row.error === "string" && row.error.trim()) return row.error;

  if (typeof row.hint === "string" && row.hint.trim()) return row.hint;



  return fallback;

}



async function supabaseRequest(

  path: string,

  body: Record<string, unknown>,

  options?: { prefer?: "minimal" | "representation" },

) {

  const { url, anonKey } = requireSupabaseConfig();

  const prefer = options?.prefer ?? "representation";



  const response = await fetch(`${url}/rest/v1/${path}`, {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      apikey: anonKey,

      Authorization: `Bearer ${anonKey}`,

      Prefer: `return=${prefer}`,

    },

    body: JSON.stringify(body),

  });



  const text = await response.text();
  let result: unknown = null;
  if (text) {
    try {
      result = JSON.parse(text) as unknown;
    } catch {
      result = null;
    }
  }



  if (!response.ok) {

    throw new Error(parseApiError(result, "Unable to save your request right now."));

  }



  return result;

}



async function callRpc<T extends SubmissionResponse>(

  functionName: string,

  body: Record<string, unknown>,

): Promise<T> {

  const result = await supabaseRequest(`rpc/${functionName}`, body);



  if (!result || typeof result !== "object") {

    throw new Error("Unable to save your request right now.");

  }



  const row = result as { reference_code?: string; message?: string };

  return {

    referenceCode: row.reference_code ?? "",

    message: row.message ?? "Your request has been received.",

  } as T;

}



async function restInsert(body: Record<string, unknown>, table: "reservations" | "enquiries") {

  await supabaseRequest(table, body, { prefer: "minimal" });

}



async function submitReservationDirect(

  payload: ReservationPayload,

): Promise<SubmissionResponse> {

  const phone = payload.phone.replace(/\D/g, "");

  const today = localTodayIso();



  if (

    !payload.name.trim() ||

    phone.length < 10 ||

    !payload.reservationDate ||

    payload.reservationDate < today ||

    !payload.reservationTime ||

    payload.guests < 1 ||

    payload.guests > 12

  ) {

    throw new Error("Please provide valid reservation details.");

  }



  const rpcBody = {

    reservation_date: payload.reservationDate,

    reservation_time: payload.reservationTime,

    guests: payload.guests,

    location: payload.location,

    name: payload.name.trim(),

    phone,

    source: payload.source,

    occasion: payload.occasion?.trim() || null,

    seating_preference: payload.seatingPreference?.trim() || null,

    email: payload.email?.trim() || null,

    special_request: payload.specialRequest?.trim() || null,

  };



  try {

    return await callRpc("website_submit_reservation", rpcBody);

  } catch (rpcError) {

    const message = rpcError instanceof Error ? rpcError.message : "";

    const rpcUnavailable =

      /function public\.website_submit_reservation|Could not find the function|42883|PGRST202/i.test(

        message,

      );



    if (!rpcUnavailable) throw rpcError;



    await restInsert(

      {

        reservation_date: payload.reservationDate,

        reservation_time: payload.reservationTime,

        guests: payload.guests,

        location: payload.location,

        occasion: payload.occasion?.trim() || null,

        seating_preference: payload.seatingPreference?.trim() || null,

        name: payload.name.trim(),

        phone,

        email: payload.email?.trim() || null,

        special_request: payload.specialRequest?.trim() || null,

        source: payload.source,

      },

      "reservations",

    );



    return {

      referenceCode: "",

      message: "Your reservation request has been received.",

    };

  }

}



async function submitEnquiryDirect(payload: EnquiryPayload): Promise<SubmissionResponse> {

  const email = payload.email.trim().toLowerCase();

  const eventDate = normalizeDate(payload.eventDate);



  if (

    !payload.name.trim() ||

    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||

    !payload.occasion.trim() ||

    !eventDate ||

    !payload.guests.trim()

  ) {

    throw new Error("Please provide valid enquiry details.");

  }



  const rpcBody = {

    type: payload.type,

    source: payload.source,

    name: payload.name.trim(),

    email,

    occasion: payload.occasion.trim(),

    event_date: eventDate,

    guests: payload.guests.trim(),

    phone: payload.phone?.replace(/\D/g, "") || null,

    event_time: payload.eventTime?.trim() || null,

    message: payload.message?.trim() || null,

  };



  try {

    return await callRpc("website_submit_enquiry", rpcBody);

  } catch (rpcError) {

    const message = rpcError instanceof Error ? rpcError.message : "";

    const rpcUnavailable =

      /function public\.website_submit_enquiry|Could not find the function|42883|PGRST202/i.test(

        message,

      );



    if (!rpcUnavailable) throw rpcError;



    await restInsert(

      {

        type: payload.type,

        source: payload.source,

        name: payload.name.trim(),

        email,

        phone: payload.phone?.replace(/\D/g, "") || null,

        occasion: payload.occasion.trim(),

        event_date: eventDate,

        event_time: payload.eventTime?.trim() || null,

        guests: payload.guests.trim(),

        message: payload.message?.trim() || null,

      },

      "enquiries",

    );



    return {

      referenceCode: "",

      message: "Your enquiry has been received.",

    };

  }

}



export async function submitReservation(payload: ReservationPayload) {

  return submitReservationDirect(payload);

}



export async function submitEnquiry(payload: EnquiryPayload) {

  return submitEnquiryDirect(payload);

}

