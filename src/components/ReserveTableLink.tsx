import { useSiteSettings } from "@/lib/site-settings";

const RESERVE_WHATSAPP_MESSAGE =
  "Hi! I’d like to reserve a table at Off White. Could you please help me with the reservation?";

type ReserveTableLinkProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function ReserveTableLink({ className, children, onClick }: ReserveTableLinkProps) {
  const settings = useSiteSettings();
  const href =
    "https://wa.me/" +
    settings.whatsapp_number +
    "?text=" +
    encodeURIComponent(RESERVE_WHATSAPP_MESSAGE);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
