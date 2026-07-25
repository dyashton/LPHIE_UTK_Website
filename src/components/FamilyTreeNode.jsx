import { Handle, Position } from "reactflow";
import { useState } from "react";
import { FAMILY_ACCENT, REVEAL_MS_PER_DEPTH } from "../utils/familyTree";

const colorDict = {
    UTK: "border-ut-orange text-ut-orange bg-ut-orange/10",
    NCSU: "border-ncsu-red text-ncsu-red bg-ncsu-red/10",
    "UNC Charlotte": "border-unc-charlotte-green text-unc-charlotte-green bg-unc-charlotte-green/10",
    "UNC Chapel Hill": "border-unc-blue text-unc-blue bg-unc-blue/10",
    UGA: "border-uga-red text-uga-red bg-uga-red/10",
    Vanderbilt: "border-vandy-gold text-vandy-gold bg-vandy-gold/10",
    Duke: "border-duke-blue text-duke-blue bg-duke-blue/10",
    UCF: "border-ucf-gold text-ucf-gold bg-ucf-gold/10",
    Default: "border-text-primary text-text-primary",
};

const schoolGlowDict = {
    UTK: "ring-4 ring-ut-orange/50 drop-shadow-[0_0_20px_rgba(255,130,0,0.8)]",
    NCSU: "ring-4 ring-ncsu-red/50 drop-shadow-[0_0_20px_rgba(204,0,0,0.8)]",
    "UNC Charlotte": "ring-4 ring-unc-charlotte-green/50 drop-shadow-[0_0_20px_rgba(0,153,0,0.8)]",
    "UNC Chapel Hill": "ring-4 ring-unc-blue/50 drop-shadow-[0_0_20px_rgba(75,156,211,0.8)]",
    UGA: "ring-4 ring-uga-red/50 drop-shadow-[0_0_20px_rgba(186,12,47,0.8)]",
    Vanderbilt: "ring-4 ring-vandy-gold/50 drop-shadow-[0_0_20px_rgba(198,146,20,0.8)]",
    Duke: "ring-4 ring-duke-blue/50 drop-shadow-[0_0_20px_rgba(0,48,135,0.8)]",
    UCF: "ring-4 ring-ucf-gold/50 drop-shadow-[0_0_20px_rgba(255,199,44,0.8)]",
};

/** Presentational brother node — hover card is owned by FamilyTreeCanvas */
export default function FamilyTreeNode({ data }) {
    const accent = FAMILY_ACCENT[data.family];
    const dimmed = data.dimmed;
    const highlighted = data.highlighted;
    const isFocus = data.isFocus;
    const glowClass = highlighted
        ? data.highlightKind === "family"
            ? accent?.glow || ""
            : schoolGlowDict[data.school] || ""
        : "";

    const delay = (data.depth ?? 0) * REVEAL_MS_PER_DEPTH;
    const [revealDone, setRevealDone] = useState(false);

    return (
        <div
            className={`relative px-4 py-2 rounded-sm border ${colorDict[data.school] || colorDict.Default} shadow w-[200px] h-[60px] ${glowClass} ${isFocus ? "family-tree-node-pulse" : ""} ${!revealDone ? "family-tree-node-reveal" : ""} ${dimmed ? "opacity-20" : "opacity-100"}`}
            style={{ animationDelay: revealDone ? undefined : `${delay}ms` }}
            onAnimationEnd={(e) => {
                if (e.target === e.currentTarget) setRevealDone(true);
            }}
        >
            {accent && (
                <span
                    className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-sm ${accent.stripe}`}
                    aria-hidden
                />
            )}
            <Handle type="target" position={Position.Top} className="!bg-tertiary !w-2 !h-2" />
            <div className="font-semibold text-text-primary text-center text-sm flex items-center justify-center h-full pl-1 pointer-events-none">
                {data.label}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-tertiary !w-2 !h-2" />
        </div>
    );
}

export function FamilyHullNode({ data }) {
    const accent = FAMILY_ACCENT[data.family];
    const highlighted = data.highlighted;
    const dimmed = data.dimmed;
    const size = Math.min(data.width || 200, data.height || 200);

    return (
        <div
            className={`relative overflow-hidden rounded-md border cursor-pointer ${accent?.hull || "bg-tertiary/10 border-tertiary/30"} ${dimmed ? "opacity-20" : "opacity-100"} transition-opacity duration-200`}
            style={{ width: data.width, height: data.height }}
        >
            <span
                className="absolute inset-0 flex items-center justify-center font-cinzel font-semibold tracking-wide select-none px-4 text-center leading-none transition-colors duration-200 pointer-events-none"
                style={{
                    fontSize: `clamp(1.75rem, ${size * 0.22}px, 5.5rem)`,
                    color: highlighted
                        ? "rgba(242, 243, 244, 0.58)"
                        : accent?.hex
                          ? `${accent.hex}40`
                          : "rgba(242, 243, 244, 0.12)",
                }}
                aria-hidden
            >
                {data.family}
            </span>
        </div>
    );
}
