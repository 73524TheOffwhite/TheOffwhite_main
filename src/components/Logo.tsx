import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  className,
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <img
      src={light ? logoLight : logoDark}
      alt="The Off White"
      className={cn("h-16 w-auto select-none object-contain", className)}
      draggable={false}
    />
  );
}
