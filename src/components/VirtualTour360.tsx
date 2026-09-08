import { useEffect, useMemo, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import type { VirtualTourPlugin as VirtualTourPluginType } from "@photo-sphere-viewer/virtual-tour-plugin";
import { Move3d } from "lucide-react";
import {
  tourNodes as defaultTourNodes,
  tourScenes as defaultTourScenes,
} from "@/data/virtual-tour";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/virtual-tour-plugin/index.css";

function createTourArrow(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tour-arrow-btn";
  btn.setAttribute("aria-label", "Move forward");
  btn.innerHTML = `
    <span class="tour-arrow-btn__ring" aria-hidden="true"></span>
    <span class="tour-arrow-btn__icon" aria-hidden="true">→</span>
  `;
  return btn;
}

export type VirtualTourScene = {
  id: string;
  name: string;
  label: string;
  panorama: string;
  thumbnail: string;
  links: Array<{
    nodeId: string;
    position: { yaw: string; pitch: string };
    name: string;
  }>;
};

type VirtualTour360Props = {
  startSceneId?: string;
  className?: string;
  scenes?: VirtualTourScene[];
};

function toTourScenes(scenes: VirtualTourScene[]) {
  return scenes.map((scene) => ({
    id: scene.id,
    name: scene.name,
    label: scene.label,
    panorama: scene.panorama,
    thumbnail: scene.thumbnail,
    links: scene.links,
  }));
}

function toTourNodes(scenes: VirtualTourScene[]) {
  return scenes.map((scene) => ({
    id: scene.id,
    name: scene.name,
    panorama: scene.panorama,
    thumbnail: scene.thumbnail,
    caption: scene.label,
    links: scene.links,
  }));
}

export function VirtualTour360({
  startSceneId,
  className = "",
  scenes,
}: VirtualTour360Props) {
  const tourScenes = useMemo(
    () => (scenes?.length ? toTourScenes(scenes) : defaultTourScenes),
    [scenes],
  );
  const tourNodes = useMemo(
    () => (scenes?.length ? toTourNodes(scenes) : defaultTourNodes),
    [scenes],
  );
  const initialSceneId = startSceneId || tourScenes[0]?.id || "entrance";

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const tourRef = useRef<VirtualTourPluginType | null>(null);
  const [activeScene, setActiveScene] = useState(initialSceneId);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const startScene = tourScenes.find((scene) => scene.id === initialSceneId) ?? tourScenes[0];
    if (!startScene) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: startScene.panorama,
      navbar: ["zoom", "move", "fullscreen"],
      defaultZoomLvl: 0,
      mousemove: true,
      mousewheel: true,
      touchmoveTwoFingers: true,
      caption: startScene.label,
      plugins: [
        VirtualTourPlugin.withConfig({
          nodes: tourNodes,
          startNodeId: startScene.id,
          preload: true,
          renderMode: "3d",
          showLinkTooltip: true,
          transitionOptions: {
            effect: "fade",
            speed: "28rpm",
            rotation: true,
            showLoader: true,
            zoomTo: 10,
          },
          arrowStyle: {
            element: createTourArrow,
            size: { width: 72, height: 72 },
          },
        }),
      ],
    });

    const tour = viewer.getPlugin(VirtualTourPlugin) as VirtualTourPluginType;
    tourRef.current = tour;
    viewerRef.current = viewer;

    const onNodeChanged = ({ node }: { node: { id: string } }) => {
      setActiveScene(node.id);
    };

    tour.addEventListener("node-changed", onNodeChanged);
    setActiveScene(startScene.id);
    setIsReady(true);

    return () => {
      tour.removeEventListener("node-changed", onNodeChanged);
      viewer.destroy();
      viewerRef.current = null;
      tourRef.current = null;
      setIsReady(false);
    };
  }, [initialSceneId, tourNodes, tourScenes]);

  const goToScene = (sceneId: string) => {
    tourRef.current?.setCurrentNode(sceneId);
  };

  const active = tourScenes.find((scene) => scene.id === activeScene) ?? tourScenes[0];

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-md border border-[var(--border)] bg-[var(--ink)] shadow-[0_20px_60px_-24px_rgba(43,33,24,0.35)]">
        <div
          ref={containerRef}
          className="h-[min(72vh,640px)] w-full [&_.psv-navbar]:!bg-black/35 [&_.psv-caption]:!font-sans [&_.psv-caption]:!text-[11px] [&_.psv-caption]:!uppercase [&_.psv-caption]:!tracking-[0.22em]"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--cream-warm)]">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Loading 360° view…
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/45 to-transparent px-4 py-4 sm:px-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
              Virtual tour
            </p>
            <p className="mt-1 font-serif text-lg text-white">{active?.label}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
            <Move3d className="h-3.5 w-3.5" strokeWidth={1.5} />
            Drag to look
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-[var(--ink-muted)] leading-relaxed max-w-xl">
          Click the glowing arrows to walk deeper into the space. Drag or swipe to look around —
          like standing inside The Off White. Demo interiors courtesy of{" "}
          <a
            href="https://polyhaven.com/hdris"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--cocoa)] underline-offset-2 hover:underline"
          >
            Poly Haven
          </a>
          .
        </p>

        <div className="flex gap-2 sm:gap-3" role="tablist" aria-label="Tour scenes">
          {tourScenes.map((scene) => {
            const isActive = scene.id === activeScene;
            return (
              <button
                key={scene.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => goToScene(scene.id)}
                className={`group relative h-16 w-14 sm:h-[72px] sm:w-16 overflow-hidden rounded-sm border transition-all duration-300 ${
                  isActive
                    ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/30"
                    : "border-[var(--border)] hover:border-[var(--cocoa)]"
                }`}
              >
                <img
                  src={scene.thumbnail}
                  alt={scene.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-1 text-[8px] uppercase tracking-[0.14em] text-white/90">
                  {scene.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
