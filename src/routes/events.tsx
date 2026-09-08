import { createFileRoute } from "@tanstack/react-router";
import { ReservationsPage } from "@/components/ReservationsPage";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Reservations — The Off White" },
      {
        name: "description",
        content: "Reserve your table at The Off White Bar & Grill. Book Level 4 dining or Level 5 events in Navelim, South Goa.",
      },
      { property: "og:title", content: "Reservations — The Off White" },
      {
        property: "og:description",
        content: "Good food. Warm ambience. Memories to be made.",
      },
    ],
  }),
  component: ReservationsPage,
});
