import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Dishes } from "@/components/sections/Dishes";
import { Space } from "@/components/sections/Space";
import { MenuAndReserve } from "@/components/sections/MenuAndReserve";
import { Testimonials } from "@/components/sections/Testimonials";
import { InstagramFeed } from "@/components/sections/InstagramFeed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Off White — Fine Dining, Crafted Cocktails, Mediterranean Soul" },
      { name: "description", content: "Where architecture meets cuisine. Fine dining at The Off White Bar & Grill in Navelim, South Goa." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Story />
      <Dishes />
      <Space />
      <MenuAndReserve />
      <Testimonials />
      <InstagramFeed />
    </>
  );
}
