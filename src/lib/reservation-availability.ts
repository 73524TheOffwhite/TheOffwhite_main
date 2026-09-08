import { useQuery } from "@tanstack/react-query";

export const DEFAULT_TIME_SLOTS = [
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
];

export const DEFAULT_MAX_GUESTS = 12;

export type ReservationAvailability = {
  timeSlots: string[];
  blackoutDates: string[];
  maxGuests: number;
};

const DEFAULT_AVAILABILITY: ReservationAvailability = {
  timeSlots: DEFAULT_TIME_SLOTS,
  blackoutDates: [],
  maxGuests: DEFAULT_MAX_GUESTS,
};

async function supabaseFetch<T>(path: string): Promise<T | null> {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

async function fetchReservationAvailability(): Promise<ReservationAvailability> {
  const today = new Date().toISOString().slice(0, 10);

  const [slots, blackouts] = await Promise.all([
    supabaseFetch<
      Array<{
        time_slot: string;
        max_guests: number;
        location: string;
        sort_order: number;
      }>
    >(
      "v_public_reservation_config?select=time_slot,max_guests,location,sort_order&order=sort_order.asc",
    ),
    supabaseFetch<Array<{ blackout_date: string; location: string }>>(
      `blackout_dates?select=blackout_date,location&is_active=eq.true&blackout_date=gte.${today}`,
    ),
  ]);

  if (!slots?.length) {
    const fallbackSlots = await supabaseFetch<
      Array<{
        time_slot: string;
        max_guests: number;
        location: string;
        sort_order: number;
      }>
    >(
      "reservation_settings?select=time_slot,max_guests,location,sort_order&is_active=eq.true&order=sort_order.asc",
    );
    if (!fallbackSlots?.length) return DEFAULT_AVAILABILITY;
    return buildAvailability(fallbackSlots, blackouts || []);
  }

  return buildAvailability(slots, blackouts || []);
}

function buildAvailability(
  slots: Array<{
    time_slot: string;
    max_guests: number;
    location: string;
    sort_order: number;
  }>,
  blackouts: Array<{ blackout_date: string }>,
): ReservationAvailability {
  const timeSlots = [
    ...new Set(
      slots
        .filter((slot) => slot.location === "all" || slot.location === "level4")
        .map((slot) => slot.time_slot),
    ),
  ];

  const maxGuests = Math.min(
    12,
    Math.max(...slots.map((slot) => slot.max_guests), DEFAULT_MAX_GUESTS),
  );

  return {
    timeSlots: timeSlots.length ? timeSlots : DEFAULT_TIME_SLOTS,
    blackoutDates: blackouts.map((row) => row.blackout_date),
    maxGuests,
  };
}

export function useReservationAvailability() {
  return useQuery({
    queryKey: ["reservation-availability"],
    queryFn: fetchReservationAvailability,
    initialData: DEFAULT_AVAILABILITY,
    staleTime: 5 * 60 * 1000,
  }).data;
}

export function isBlackoutDate(
  date: string,
  location: "level4" | "level5",
  blackoutDates: string[],
) {
  if (!date) return false;
  return blackoutDates.includes(date);
}
