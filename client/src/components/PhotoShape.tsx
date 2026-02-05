import { CSSProperties } from "react";

export type PhotoShapeType = 
  | "square" 
  | "circle" 
  | "heart" 
  | "hexagon" 
  | "diamond" 
  | "arch" 
  | "frame"
  | "oval"
  | "soft-arch"
  | "petal"
  | "ornate"
  | "vintage";

interface PhotoShapeProps {
  imageUrl: string;
  shape: PhotoShapeType;
  themeColor?: string;
  alt?: string;
  className?: string;
}

const getClipPath = (shape: PhotoShapeType): string => {
  switch (shape) {
    case "circle":
      return "circle(50% at 50% 50%)";
    case "oval":
      return "ellipse(45% 50% at 50% 50%)";
    case "heart":
      // Smooth heart with more natural curves
      return `path("M 50 88 C 25 70, 5 50, 5 30 C 5 15, 18 5, 32 5 C 42 5, 50 15, 50 22 C 50 15, 58 5, 68 5 C 82 5, 95 15, 95 30 C 95 50, 75 70, 50 88 Z")`;
    case "hexagon":
      // Rounded hexagon
      return "polygon(25% 5%, 75% 5%, 97% 50%, 75% 95%, 25% 95%, 3% 50%)";
    case "diamond":
      // Softer diamond with curved sides
      return "polygon(50% 2%, 98% 50%, 50% 98%, 2% 50%)";
    case "arch":
      // Classic smooth arch
      return "path('M 0 100 L 0 35 Q 0 0, 50 0 Q 100 0, 100 35 L 100 100 Z')";
    case "soft-arch":
      // Very soft, gentle arch
      return "path('M 0 100 L 0 25 Q 0 5, 25 2 Q 50 0, 75 2 Q 100 5, 100 25 L 100 100 Z')";
    case "petal":
      // Flower petal / teardrop shape
      return "path('M 50 95 C 15 75, 5 40, 25 15 Q 40 2, 50 2 Q 60 2, 75 15 C 95 40, 85 75, 50 95 Z')";
    case "frame":
      // Elegant rounded corners
      return "polygon(8% 0%, 92% 0%, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0% 92%, 0% 8%)";
    case "ornate":
      // Decorative scalloped edge - simplified for clip-path
      return "polygon(10% 0%, 20% 5%, 30% 0%, 40% 5%, 50% 0%, 60% 5%, 70% 0%, 80% 5%, 90% 0%, 100% 10%, 95% 20%, 100% 30%, 95% 40%, 100% 50%, 95% 60%, 100% 70%, 95% 80%, 100% 90%, 90% 100%, 80% 95%, 70% 100%, 60% 95%, 50% 100%, 40% 95%, 30% 100%, 20% 95%, 10% 100%, 0% 90%, 5% 80%, 0% 70%, 5% 60%, 0% 50%, 5% 40%, 0% 30%, 5% 20%, 0% 10%)";
    case "vintage":
      // Classic vintage frame shape
      return "polygon(5% 5%, 15% 0%, 85% 0%, 95% 5%, 100% 15%, 100% 85%, 95% 95%, 85% 100%, 15% 100%, 5% 95%, 0% 85%, 0% 15%)";
    case "square":
    default:
      return "none";
  }
};

const getFrameStyle = (shape: PhotoShapeType, themeColor?: string): CSSProperties => {
  const color = themeColor || "#D4AF37";
  
  const baseStyle: CSSProperties = {
    position: "relative",
  };

  switch (shape) {
    case "circle":
      return {
        ...baseStyle,
        border: `3px solid ${color}`,
        borderRadius: "50%",
        boxShadow: `0 8px 32px ${color}30, 0 2px 8px rgba(0,0,0,0.15)`,
      };
    case "oval":
      return {
        ...baseStyle,
        border: `3px solid ${color}`,
        borderRadius: "50%",
        boxShadow: `0 8px 32px ${color}30, 0 4px 16px rgba(0,0,0,0.1)`,
      };
    case "heart":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 8px 24px ${color}40) drop-shadow(0 4px 12px rgba(0,0,0,0.15))`,
      };
    case "hexagon":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 6px 20px ${color}35) drop-shadow(0 3px 10px rgba(0,0,0,0.12))`,
      };
    case "diamond":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 8px 24px ${color}40) drop-shadow(0 4px 12px rgba(0,0,0,0.15))`,
      };
    case "arch":
    case "soft-arch":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 10px 30px ${color}35) drop-shadow(0 4px 12px rgba(0,0,0,0.12))`,
      };
    case "petal":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 8px 28px ${color}40) drop-shadow(0 4px 14px rgba(0,0,0,0.12))`,
      };
    case "ornate":
      return {
        ...baseStyle,
        filter: `drop-shadow(0 6px 20px ${color}45) drop-shadow(0 3px 8px rgba(0,0,0,0.15))`,
      };
    case "vintage":
      return {
        ...baseStyle,
        border: `4px solid ${color}`,
        boxShadow: `0 0 0 2px ${color}20, 0 10px 40px ${color}30, 0 4px 16px rgba(0,0,0,0.12)`,
      };
    case "frame":
      return {
        ...baseStyle,
        border: `5px solid ${color}`,
        borderRadius: "8px",
        boxShadow: `0 0 0 3px ${color}15, 0 12px 40px ${color}25, 0 4px 16px rgba(0,0,0,0.12)`,
      };
    case "square":
    default:
      return {
        ...baseStyle,
        borderRadius: "16px",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0,0,0,0.08)",
      };
  }
};

// Decorative SVG overlays for premium shapes
const getDecorativeOverlay = (shape: PhotoShapeType, themeColor?: string) => {
  const color = themeColor || "#D4AF37";
  
  switch (shape) {
    case "ornate":
      return (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Corner ornaments */}
          <path 
            d="M 5 15 Q 5 5, 15 5" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
            opacity="0.6"
          />
          <path 
            d="M 85 5 Q 95 5, 95 15" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
            opacity="0.6"
          />
          <path 
            d="M 95 85 Q 95 95, 85 95" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
            opacity="0.6"
          />
          <path 
            d="M 15 95 Q 5 95, 5 85" 
            fill="none" 
            stroke={color} 
            strokeWidth="1"
            opacity="0.6"
          />
          {/* Small decorative circles at corners */}
          <circle cx="5" cy="5" r="2" fill={color} opacity="0.4" />
          <circle cx="95" cy="5" r="2" fill={color} opacity="0.4" />
          <circle cx="95" cy="95" r="2" fill={color} opacity="0.4" />
          <circle cx="5" cy="95" r="2" fill={color} opacity="0.4" />
        </svg>
      );
    case "vintage":
      return (
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Elegant corner flourishes */}
          <path 
            d="M 8 20 Q 4 10, 15 6 M 4 15 Q 8 8, 20 8" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.8"
            opacity="0.5"
          />
          <path 
            d="M 80 8 Q 92 8, 96 15 M 85 6 Q 96 10, 92 20" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.8"
            opacity="0.5"
          />
          <path 
            d="M 92 80 Q 96 90, 85 94 M 96 85 Q 92 92, 80 92" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.8"
            opacity="0.5"
          />
          <path 
            d="M 20 92 Q 8 92, 4 85 M 15 94 Q 4 90, 8 80" 
            fill="none" 
            stroke={color} 
            strokeWidth="0.8"
            opacity="0.5"
          />
        </svg>
      );
    case "petal":
      return (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 20%, ${color}08 0%, transparent 60%)`,
          }}
        />
      );
    default:
      return null;
  }
};

export default function PhotoShape({ 
  imageUrl, 
  shape, 
  themeColor, 
  alt = "Wedding photo",
  className = ""
}: PhotoShapeProps) {
  const clipPath = getClipPath(shape);
  const frameStyle = getFrameStyle(shape, themeColor);
  const decorativeOverlay = getDecorativeOverlay(shape, themeColor);

  // For path-based shapes, we need to use SVG mask
  const useSvgMask = ["heart", "arch", "soft-arch", "petal"].includes(shape);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={frameStyle}
    >
      {useSvgMask ? (
        // Use SVG for smooth curved shapes
        <svg 
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <clipPath id={`clip-${shape}`}>
              {shape === "heart" && (
                <path d="M 50 88 C 25 70, 5 50, 5 28 C 5 12, 18 2, 32 2 C 42 2, 50 12, 50 20 C 50 12, 58 2, 68 2 C 82 2, 95 12, 95 28 C 95 50, 75 70, 50 88 Z" />
              )}
              {shape === "arch" && (
                <path d="M 0 100 L 0 32 Q 0 0, 50 0 Q 100 0, 100 32 L 100 100 Z" />
              )}
              {shape === "soft-arch" && (
                <path d="M 0 100 L 0 22 Q 0 5, 25 2 Q 50 0, 75 2 Q 100 5, 100 22 L 100 100 Z" />
              )}
              {shape === "petal" && (
                <path d="M 50 95 C 15 75, 5 40, 25 15 Q 40 2, 50 2 Q 60 2, 75 15 C 95 40, 85 75, 50 95 Z" />
              )}
            </clipPath>
          </defs>
          <image 
            href={imageUrl} 
            x="0" 
            y="0" 
            width="100" 
            height="100"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#clip-${shape})`}
          />
        </svg>
      ) : (
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            clipPath: clipPath !== "none" ? clipPath : undefined,
            borderRadius: shape === "square" ? "16px" : undefined,
          }}
        />
      )}
      
      {/* Decorative overlay for premium shapes */}
      {decorativeOverlay}
      
      {/* Subtle inner glow for certain shapes */}
      {(shape === "frame" || shape === "vintage") && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${themeColor || "#D4AF37"}08, transparent 40%, ${themeColor || "#D4AF37"}05)`,
            borderRadius: shape === "frame" ? "8px" : undefined,
          }}
        />
      )}
    </div>
  );
}
