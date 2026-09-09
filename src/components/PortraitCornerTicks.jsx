// L-shaped corner ticks: rest half-off the edge; on group-hover, settle inset.
function TickSvg({ size, corner }) {
  const px = size === "sm" ? 22 : 32;
  const arm = 10;
  const thick = size === "sm" ? 1.35 : 1.55;
  // Single polygon: outer elbow at (0,0), arms along +x / +y, tips taper to points.
  const d = [
    `M 0 0`,
    `L ${arm} 0`,
    `L ${thick} ${thick}`,
    `L 0 ${arm}`,
    `Z`,
  ].join(" ");
  const rot = { tl: 0, tr: 90, br: 180, bl: 270 }[corner];

  return (
    <svg
      width={px}
      height={px}
      viewBox="-10 -10 20 20"
      className="block text-accent"
      fill="currentColor"
      aria-hidden
    >
      <g transform={`rotate(${rot})`}>
        <path d={d} />
      </g>
    </svg>
  );
}

const CORNERS =
  // ponytail: full class strings so Tailwind JIT sees them
  {
    sm: [
      {
        key: "tl",
        className:
          "top-0 left-0 -translate-x-1/2 -translate-y-1/2 group-hover:top-1 group-hover:left-1 group-hover:translate-x-0 group-hover:translate-y-0",
      },
      {
        key: "tr",
        className:
          "top-0 right-0 translate-x-1/2 -translate-y-1/2 group-hover:top-1 group-hover:right-1 group-hover:translate-x-0 group-hover:translate-y-0",
      },
      {
        key: "bl",
        className:
          "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 group-hover:bottom-1 group-hover:left-1 group-hover:translate-x-0 group-hover:translate-y-0",
      },
      {
        key: "br",
        className:
          "bottom-0 right-0 translate-x-1/2 translate-y-1/2 group-hover:bottom-1 group-hover:right-1 group-hover:translate-x-0 group-hover:translate-y-0",
      },
    ],
    md: [
      {
        key: "tl",
        className:
          "top-0 left-0 -translate-x-1/2 -translate-y-1/2 group-hover:top-1.5 group-hover:left-1.5 group-hover:translate-x-0 group-hover:translate-y-0 sm:group-hover:top-2 sm:group-hover:left-2",
      },
      {
        key: "tr",
        className:
          "top-0 right-0 translate-x-1/2 -translate-y-1/2 group-hover:top-1.5 group-hover:right-1.5 group-hover:translate-x-0 group-hover:translate-y-0 sm:group-hover:top-2 sm:group-hover:right-2",
      },
      {
        key: "bl",
        className:
          "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 group-hover:bottom-1.5 group-hover:left-1.5 group-hover:translate-x-0 group-hover:translate-y-0 sm:group-hover:bottom-2 sm:group-hover:left-2",
      },
      {
        key: "br",
        className:
          "bottom-0 right-0 translate-x-1/2 translate-y-1/2 group-hover:bottom-1.5 group-hover:right-1.5 group-hover:translate-x-0 group-hover:translate-y-0 sm:group-hover:bottom-2 sm:group-hover:right-2",
      },
    ],
  };

export default function PortraitCornerTicks({ className = "", size = "md" }) {
  const corners = CORNERS[size] || CORNERS.md;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-[4] overflow-visible ${className}`}
      aria-hidden
    >
      {corners.map(({ key, className: pos }) => (
        <span
          key={key}
          className={`absolute transition-[top,right,bottom,left,transform] duration-200 ease-out ${pos}`}
        >
          <TickSvg size={size} corner={key} />
        </span>
      ))}
    </div>
  );
}
