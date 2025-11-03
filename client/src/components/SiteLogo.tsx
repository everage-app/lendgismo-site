import { Link } from "wouter";
// Use the attached brand logo for headers/footers (keep favicon as-is elsewhere)
// Import as URL to ensure optimal bundling and caching (transparent background version)
import logoUrl from "@assets/lendgismo-logo-white-transparent.svg?url";

type Props = {
  className?: string;
  size?: number;
  glow?: boolean;
  ariaLabel?: string;
  linkTestId?: string;
  imgTestId?: string;
};

export default function SiteLogo({
  className = "",
  size = 40,
  glow = false,
  ariaLabel = "Lendgismo Home",
  linkTestId = "link-home",
  imgTestId = "img-logo",
}: Props) {
  const height = size; // treat `size` as the intended pixel height
  const baseClasses = "inline-flex items-center select-none";
  const glowClasses = glow ? "lglogo-glow" : "";
  const logoSrc = logoUrl;

  return (
    <Link href="/" aria-label={ariaLabel} data-testid={linkTestId}>
      <div className={`${baseClasses} ${glowClasses} ${className}`}>
        <img
          src={logoSrc}
          alt="Lendgismo"
          className="logo-img"
          style={{ height: `${height}px`, width: "auto" }}
          decoding="async"
          data-testid={imgTestId}
        />
      </div>
    </Link>
  );
}
