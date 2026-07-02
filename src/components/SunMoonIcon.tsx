type SunMoonIconProps = {
  variant: "sun" | "moon";
  size?: number;
  className?: string;
};

export function SunMoonIcon({
  variant,
  size = 20,
  className,
}: SunMoonIconProps) {
  if (variant === "sun") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sun-core-mp" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#fff6d6" />
            <stop offset="55%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
        <g stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round">
          <line x1="12" y1="1.5" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22.5" />
          <line x1="1.5" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22.5" y2="12" />
          <line x1="4.5" y1="4.5" x2="6.3" y2="6.3" />
          <line x1="17.7" y1="17.7" x2="19.5" y2="19.5" />
          <line x1="19.5" y1="4.5" x2="17.7" y2="6.3" />
          <line x1="6.3" y1="17.7" x2="4.5" y2="19.5" />
        </g>
        <circle cx="12" cy="12" r="5.5" fill="url(#sun-core-mp)" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="moon-core-mp" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="60%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </radialGradient>
      </defs>
      <path
        d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z"
        fill="url(#moon-core-mp)"
      />
      <circle cx="16.5" cy="6.5" r="0.7" fill="#f5f3ff" />
      <circle cx="19" cy="10" r="0.5" fill="#f5f3ff" />
      <circle cx="14.5" cy="3.5" r="0.4" fill="#f5f3ff" />
    </svg>
  );
}
