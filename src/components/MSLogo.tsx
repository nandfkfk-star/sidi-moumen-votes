export function MSLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="msg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#5b1a4a" />
          <stop offset="100%" stopColor="#3a0f30" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="88" height="88" rx="22" fill="white" stroke="#e5d6e0" strokeWidth="2" />
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontWeight="700"
        fontSize="54"
        fill="url(#msg)"
        letterSpacing="-2"
      >
        MS
      </text>
    </svg>
  );
}
