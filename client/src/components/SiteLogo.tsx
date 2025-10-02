import { Link } from "wouter";

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
  const height = size;
  const width = Math.round((size * 408) / 150);
  const baseClasses = "inline-flex items-center select-none";
  const glowClasses = glow ? "lglogo-glow" : "";

  return (
    <Link href="/" aria-label={ariaLabel} data-testid={linkTestId}>
      <div className={`${baseClasses} ${glowClasses} ${className}`}>
        <img
          src="/brand/lendgismo-logo-white.png"
          alt="Lendgismo"
          className="logo-img"
          width={width}
          height={height}
          data-testid={imgTestId}
        />
      </div>
    </Link>
  );
}
