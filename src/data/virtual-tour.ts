import niche from "@/assets/niche.jpg";
import bar from "@/assets/space-bar.jpg";
import dining from "@/assets/space-dining.jpg";

export type TourSceneId = "entrance" | "arch" | "dining";

export type TourScene = {
  id: TourSceneId;
  name: string;
  label: string;
  panorama: string;
  thumbnail: string;
  links: {
    nodeId: TourSceneId;
    position: { yaw: string; pitch: string };
    name: string;
  }[];
};

/** Demo restaurant interiors (CC0) from Poly Haven — swap for your own `/panos/*.jpg` shots. */
const PANOS = {
  entrance:
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/comfy_cafe.jpg",
  bar: "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/wooden_lounge.jpg",
  dining:
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/anniversary_lounge.jpg",
} as const;

export const tourScenes: TourScene[] = [
  {
    id: "entrance",
    name: "Lounge",
    label: "Café lounge",
    panorama: PANOS.entrance,
    thumbnail: niche,
    links: [
      {
        nodeId: "arch",
        position: { yaw: "25deg", pitch: "-12deg" },
        name: "Bar & lounge",
      },
      {
        nodeId: "dining",
        position: { yaw: "-70deg", pitch: "-8deg" },
        name: "Dining room",
      },
    ],
  },
  {
    id: "arch",
    name: "Bar",
    label: "Bar & lounge",
    panorama: PANOS.bar,
    thumbnail: bar,
    links: [
      {
        nodeId: "entrance",
        position: { yaw: "175deg", pitch: "-10deg" },
        name: "Back to lounge",
      },
      {
        nodeId: "dining",
        position: { yaw: "20deg", pitch: "-12deg" },
        name: "Dining room",
      },
    ],
  },
  {
    id: "dining",
    name: "Dining",
    label: "Dining room",
    panorama: PANOS.dining,
    thumbnail: dining,
    links: [
      {
        nodeId: "arch",
        position: { yaw: "-150deg", pitch: "-10deg" },
        name: "Bar & lounge",
      },
      {
        nodeId: "entrance",
        position: { yaw: "110deg", pitch: "-8deg" },
        name: "Café lounge",
      },
    ],
  },
];

export const tourNodes = tourScenes.map((scene) => ({
  id: scene.id,
  name: scene.name,
  panorama: scene.panorama,
  thumbnail: scene.thumbnail,
  caption: scene.label,
  links: scene.links.map((link) => ({
    nodeId: link.nodeId,
    position: link.position,
    name: link.name,
  })),
}));
