import { Link } from "react-router-dom";

function initialsFromLabel(label) {
    if (!label) return "?";
    const parts = String(label).replace(/"/g, "").trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0]?.slice(0, 2).toUpperCase() || "?";
}

export default function BrotherHoverCard({ data, top, left, onEnter, onLeave }) {
    if (!data) return null;
    return (
        <div
            className="fixed w-56 -translate-x-1/2 bg-primary border border-tertiary/40 text-text-primary text-xs rounded-sm shadow-2xl overflow-hidden"
            style={{ top, left, zIndex: 100000 }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex gap-3 p-3">
                {data.imgSrc ? (
                    <img
                        src={data.imgSrc}
                        alt=""
                        className="w-14 h-14 object-cover rounded-sm border border-tertiary/30 shrink-0"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-sm border border-tertiary/30 bg-secondary/40 flex items-center justify-center text-text-secondary font-cinzel shrink-0">
                        {initialsFromLabel(data.label)}
                    </div>
                )}
                <div className="min-w-0 flex flex-col gap-0.5">
                    <p className="font-semibold text-sm leading-snug truncate">{data.label}</p>
                    <p className="text-text-secondary">
                        {data.school}
                        {data.family ? ` · ${data.family}` : ""}
                    </p>
                </div>
            </div>
            <div className="px-3 pb-2 space-y-1 text-text-secondary">
                <p>
                    <span className="text-text-primary/80">Big:</span>{" "}
                    {data.parentLabel || "—"}
                </p>
                <p>
                    <span className="text-text-primary/80">Littles:</span>{" "}
                    {data.childrenLabels?.length
                        ? data.childrenLabels.join(", ")
                        : "—"}
                </p>
            </div>
            {data.hasBrotherProfile && (
                <Link
                    to={`/brothers#${encodeURIComponent(data.brotherLinkId || data.id)}`}
                    className="block px-3 py-2 border-t border-tertiary/30 text-accent hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    onClick={(e) => e.stopPropagation()}
                >
                    View on Brothers →
                </Link>
            )}
        </div>
    );
}
