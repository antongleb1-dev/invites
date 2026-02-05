// Traditional Kazakh ornament SVG components

export const GoldenKoshkar = ({ className = "", color = "#D4AF37" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Koshkar muiz (ram's horn) - traditional Kazakh ornament */}
    <path
      d="M100 20 C120 20, 140 30, 150 50 C160 70, 160 90, 150 110 C140 130, 120 140, 100 140 C80 140, 60 130, 50 110 C40 90, 40 70, 50 50 C60 30, 80 20, 100 20 Z"
      fill={color}
      opacity="0.3"
    />
    <path
      d="M100 40 C115 40, 130 48, 138 63 C146 78, 146 93, 138 108 C130 123, 115 131, 100 131 C85 131, 70 123, 62 108 C54 93, 54 78, 62 63 C70 48, 85 40, 100 40 Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle cx="100" cy="80" r="15" fill={color} opacity="0.5" />
    <path
      d="M85 80 Q100 60, 115 80"
      stroke={color}
      strokeWidth="3"
      fill="none"
    />
  </svg>
);

export const FloralPattern = ({ className = "", color = "#E8B4B8" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Floral Kazakh pattern */}
    <g opacity="0.4">
      <circle cx="100" cy="100" r="40" fill={color} />
      <circle cx="70" cy="100" r="20" fill={color} />
      <circle cx="130" cy="100" r="20" fill={color} />
      <circle cx="100" cy="70" r="20" fill={color} />
      <circle cx="100" cy="130" r="20" fill={color} />
    </g>
    <path
      d="M100 60 L100 140 M60 100 L140 100"
      stroke={color}
      strokeWidth="2"
      opacity="0.6"
    />
    <circle cx="100" cy="100" r="10" fill={color} />
  </svg>
);

export const GeometricKazakh = ({ className = "", color = "#8B4513" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Geometric Kazakh pattern */}
    <rect x="50" y="50" width="100" height="100" fill={color} opacity="0.2" />
    <rect x="60" y="60" width="80" height="80" stroke={color} strokeWidth="2" fill="none" />
    <rect x="70" y="70" width="60" height="60" fill={color} opacity="0.3" />
    <path
      d="M100 50 L150 100 L100 150 L50 100 Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle cx="100" cy="100" r="20" fill={color} opacity="0.4" />
  </svg>
);

export const SilkRoadPattern = ({ className = "", color = "#4A5568" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Silk Road inspired pattern */}
    <path
      d="M20 100 Q60 60, 100 100 T180 100"
      stroke={color}
      strokeWidth="3"
      fill="none"
      opacity="0.4"
    />
    <path
      d="M20 120 Q60 80, 100 120 T180 120"
      stroke={color}
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />
    <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
    <circle cx="100" cy="100" r="15" fill={color} opacity="0.3" />
  </svg>
);

export const NomadicSymbol = ({ className = "", color = "#2D3748" }: { className?: string; color?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Nomadic heritage symbol */}
    <path
      d="M100 30 L130 70 L170 70 L140 100 L160 140 L100 110 L40 140 L60 100 L30 70 L70 70 Z"
      fill={color}
      opacity="0.3"
    />
    <path
      d="M100 40 L125 75 L160 75 L135 100 L150 135 L100 110 L50 135 L65 100 L40 75 L75 75 Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <circle cx="100" cy="100" r="25" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
  </svg>
);

// Decorative border components
export const KazakhBorderTop = ({ color = "#D4AF37" }: { color?: string }) => (
  <svg className="w-full h-16" viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 50 Q150 20, 300 50 T600 50 T900 50 T1200 50"
      stroke={color}
      strokeWidth="3"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M0 60 Q150 30, 300 60 T600 60 T900 60 T1200 60"
      stroke={color}
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />
  </svg>
);

export const KazakhBorderBottom = ({ color = "#D4AF37" }: { color?: string }) => (
  <svg className="w-full h-16" viewBox="0 0 1200 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 50 Q150 80, 300 50 T600 50 T900 50 T1200 50"
      stroke={color}
      strokeWidth="3"
      fill="none"
      opacity="0.5"
    />
    <path
      d="M0 40 Q150 70, 300 40 T600 40 T900 40 T1200 40"
      stroke={color}
      strokeWidth="2"
      fill="none"
      opacity="0.3"
    />
  </svg>
);

