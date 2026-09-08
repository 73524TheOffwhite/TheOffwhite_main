export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="label-eyebrow">
      <span aria-hidden>✦</span>
      {children}
      <span aria-hidden>✦</span>
    </span>
  );
}
