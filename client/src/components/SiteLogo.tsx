import { Link } from "wouter";
import logoImage from "@assets/Lendgismo logo_1759370117760.png";

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
  size = 28,
  glow = true,
  ariaLabel = "Lendgismo Home",
  linkTestId = "link-home",
  imgTestId = "img-logo",
}: Props) {
  const height = size;
  const baseClasses = "inline-flex items-center select-none";
  const glowClasses = glow ? "lglogo-glow" : "";

  return (
    <Link href="/" aria-label={ariaLabel} data-testid={linkTestId}>
      <div className={`${baseClasses} ${glowClasses} ${className}`}>
        <img
          src={logoImage}
          alt="Lendgismo"
          className="logo-img"
          style={{ height: `${height}px`, width: "auto" }}
          data-testid={imgTestId}
        />
      </div>
    </Link>
  );
}
