import Title from "../components/Title";
import CustomSelect from "../components/Select";
import FamilyTreeCanvas from "../components/FamilyTreeCanvas";
import { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { BrothersContext } from "../providers/BrothersContext";
import Papa from "papaparse";
import PageContainer from "../components/PageContainer";
import {
    FAMILIES,
    FAMILY_ACCENT,
    indexRows,
    lineageIds,
} from "../utils/familyTree";

/**
 * Convert flat rows into parent → children tree
 */
function buildTree(rows) {
    if (!rows || rows.length === 0) return [];
    const nodes = {};
    const roots = [];

    rows.forEach((row) => {
        const id = row.brother;
        nodes[id] = {
            id,
            brother: row.brother,
            parent: row.parent || null,
            school: row.school,
            family: row.family,
            label: row.label,
            parentLabel: null,
            children: [],
        };
    });

    rows.forEach((row) => {
        const childId = row.brother;
        const parentId = row.parent;

        if (parentId && nodes[parentId]) {
            nodes[childId].parentLabel = nodes[parentId].label;
            nodes[parentId].children.push(nodes[childId]);
        } else {
            roots.push(nodes[childId]);
        }
    });
    return roots;
}

const UNIS = ["UTK", "NCSU", "UNC Charlotte", "UNC Chapel Hill", "UGA", "Vanderbilt", "Duke", "UCF"];

const uniSwatch = {
    UTK: "bg-ut-orange",
    NCSU: "bg-ncsu-red",
    "UNC Charlotte": "bg-unc-charlotte-green",
    "UNC Chapel Hill": "bg-unc-blue",
    UGA: "bg-uga-red",
    Vanderbilt: "bg-vandy-gold",
    Duke: "bg-duke-blue",
    UCF: "bg-ucf-gold",
};

const inputClass =
    "bg-primary border border-tertiary/40 text-text-primary rounded-sm px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 w-full sm:w-64";

export default function FamilyTree() {
    const [family, setFamily] = useState("All Families");
    const [rawRows, setRawRows] = useState([]);
    const [hoverUni, setHoverUni] = useState("");
    const [hoverFamily, setHoverFamily] = useState("");
    const [status, setStatus] = useState("loading");
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [spotlightRoot, setSpotlightRoot] = useState(null);
    const [focusId, setFocusId] = useState(null);
    const [viewTick, setViewTick] = useState(0);
    const [zoomNonce, setZoomNonce] = useState(0);
    const belowCanvasRef = useRef(null);

    const { brothers, images } = useContext(BrothersContext) || {};

    // Bring the canvas into view, then nudge React Flow to re-fit
    useEffect(() => {
        if (status !== "ok") return;
        const el = belowCanvasRef.current;
        if (!el) return;
        el.scrollIntoView({ block: "end", inline: "nearest", behavior: "auto" });
        const t = requestAnimationFrame(() => {
            requestAnimationFrame(() => setViewTick((n) => n + 1));
        });
        return () => cancelAnimationFrame(t);
    }, [status]);
    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/datasets/familyTree");
                if (!res.ok) throw new Error("familyTree");
                const payload = await res.json();
                const results = Papa.parse(payload.csvText, {
                    header: true,
                    skipEmptyLines: true,
                });

                const rows = [];
                results.data.forEach((item) => {
                    rows.push({
                        family: item.family,
                        brother: item.brother,
                        parent: item.parent,
                        school: item.school,
                        label: item.label,
                    });
                });
                if (!cancelled) {
                    setRawRows(rows);
                    setStatus("ok");
                }
            } catch {
                if (!cancelled) setStatus("error");
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const byLineName = useMemo(() => {
        const map = new Map();
        (brothers || []).forEach((b) => map.set(b.lineName, b));
        return map;
    }, [brothers]);

    const enrich = useMemo(
        () => ({ byLineName, images: images || {}, brothers: brothers || [] }),
        [byLineName, images, brothers]
    );

    const { byId, children } = useMemo(() => indexRows(rawRows), [rawRows]);

    const treeData = useMemo(() => {
        if (!rawRows.length) return [];
        // Always keep full tree — family focus zooms the camera, it doesn't cut nodes
        return buildTree(rawRows);
    }, [rawRows]);

    const spotlightIds = useMemo(() => {
        if (!spotlightRoot) return new Set();
        return lineageIds(spotlightRoot, byId, children);
    }, [spotlightRoot, byId, children]);

    const searchHits = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return [];
        return rawRows
            .filter(
                (r) =>
                    r.label?.toLowerCase().includes(q) ||
                    r.brother?.toLowerCase().includes(q)
            )
            .slice(0, 8);
    }, [search, rawRows]);

    const changeFamily = useCallback((val) => {
        setFamily(val);
        setZoomNonce((n) => n + 1);
        setSpotlightRoot(null);
        setFocusId(null);
        setHoverFamily("");
        setHoverUni("");
    }, []);

    const clearSpotlight = useCallback(() => {
        setSpotlightRoot(null);
        setFocusId(null);
    }, []);

    /** Spotlight only when already zoomed into that brother's family */
    const activateSpotlight = useCallback((id) => {
        setSpotlightRoot((prev) => {
            if (prev === id) {
                setFocusId(null);
                return null;
            }
            setFocusId(id);
            return id;
        });
    }, []);

    /**
     * Brother click:
     * - not zoomed into his family → zoom to family (no spotlight)
     * - already zoomed into his family → lineage spotlight
     */
    const onBrotherClick = useCallback(
        (id) => {
            const row = byId.get(id);
            if (!row) return;
            setHoverFamily("");
            if (family === "All Families" || family !== row.family) {
                changeFamily(row.family);
                return;
            }
            activateSpotlight(id);
        },
        [byId, family, changeFamily, activateSpotlight]
    );

    /**
     * Background / hull click:
     * - not in that family (or overview) → zoom into the hit family
     * - already in that family → zoom out
     * - empty pane while focused → zoom out
     */
    const onBackgroundClick = useCallback(
        (fam) => {
            if (fam) {
                if (family === fam) changeFamily("All Families");
                else changeFamily(fam);
                return;
            }
            if (family !== "All Families") {
                changeFamily("All Families");
                return;
            }
            clearSpotlight();
        },
        [family, changeFamily, clearSpotlight]
    );

    const selectBrother = useCallback(
        (id) => {
            const row = byId.get(id);
            if (!row) return;
            setSearch("");
            setSearchOpen(false);
            if (family === "All Families" || family !== row.family) {
                changeFamily(row.family);
                return;
            }
            activateSpotlight(id);
        },
        [byId, family, changeFamily, activateSpotlight]
    );

    useEffect(() => {
        function onKey(e) {
            if (e.key !== "Escape") return;
            if (spotlightRoot) {
                clearSpotlight();
            } else if (family !== "All Families") {
                changeFamily("All Families");
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [clearSpotlight, spotlightRoot, family, changeFamily]);

    return (
        <PageContainer className="pb-10" maxWidthClassName="max-w-7xl">
            <Title as="h1" text="Family Tree" />

            {status === "loading" && (
                <p className="mt-6 text-text-secondary">Loading family tree…</p>
            )}
            {status === "error" && (
                <p className="mt-6 text-text-secondary">Couldn’t load family tree data.</p>
            )}

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <CustomSelect
                        value={family}
                        onChange={changeFamily}
                        options={[
                            { value: "All Families", label: "All Families" },
                            ...FAMILIES.map((f) => ({ value: f, label: f })),
                        ]}
                    />
                    <div className="relative w-full sm:w-64">
                        <label className="sr-only" htmlFor="family-tree-search">
                            Search brothers
                        </label>
                        <input
                            id="family-tree-search"
                            type="search"
                            placeholder="Find a brother…"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                            className={inputClass}
                        />
                        {searchOpen && searchHits.length > 0 && (
                            <ul className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-auto rounded-sm border border-tertiary/40 bg-primary shadow-lg">
                                {searchHits.map((hit) => (
                                    <li key={hit.brother}>
                                        <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/50 focus-visible:outline-none focus-visible:bg-secondary/50"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => selectBrother(hit.brother)}
                                        >
                                            <span className="text-text-primary">{hit.label}</span>
                                            <span className="block text-xs text-text-secondary">
                                                {hit.family} · {hit.school}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3 text-sm sm:text-base text-text-primary">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {UNIS.map((uni) => (
                            <button
                                key={uni}
                                type="button"
                                className="flex items-center gap-2 text-left hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                onMouseEnter={() => setHoverUni(uni)}
                                onMouseLeave={() => setHoverUni("")}
                                onFocus={() => setHoverUni(uni)}
                                onBlur={() => setHoverUni("")}
                            >
                                <div className={`w-3.5 h-3.5 ${uniSwatch[uni]}`} />
                                <span>{uni}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        {FAMILIES.map((fam) => (
                            <button
                                key={fam}
                                type="button"
                                aria-pressed={family === fam}
                                className={`flex items-center gap-2 text-left hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${family === fam ? "opacity-100 underline underline-offset-4 decoration-accent" : ""}`}
                                onMouseEnter={() => setHoverFamily(fam)}
                                onMouseLeave={() => setHoverFamily("")}
                                onFocus={() => setHoverFamily(fam)}
                                onBlur={() => setHoverFamily("")}
                                onClick={() =>
                                    changeFamily(family === fam ? "All Families" : fam)
                                }
                            >
                                <div
                                    className={`w-3.5 h-3.5 ${FAMILY_ACCENT[fam]?.swatch || "bg-text-primary/30"}`}
                                />
                                <span>{fam}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {spotlightRoot && (
                <p className="mt-3 text-sm text-text-secondary">
                    Lineage spotlight on{" "}
                    <span className="text-text-primary">
                        {byId.get(spotlightRoot)?.label || spotlightRoot}
                    </span>
                    {" — "}click the brother again or press Esc to clear. Click the
                    family background to zoom out.
                </p>
            )}
            {!spotlightRoot && family !== "All Families" && (
                <p className="mt-3 text-sm text-text-secondary">
                    Viewing {family} — click a brother for lineage, or the
                    background / Esc to zoom out.
                </p>
            )}

            <div className="h-[70vh] sm:h-[75vh] lg:h-[78vh] w-full mt-6 border border-tertiary/30 bg-primary/40">
                {status === "ok" && (
                    <FamilyTreeCanvas
                        treeData={treeData}
                        enrich={enrich}
                        hoverUni={hoverUni}
                        hoverFamily={hoverFamily}
                        focusedFamily={family === "All Families" ? "" : family}
                        zoomNonce={zoomNonce}
                        spotlightIds={spotlightIds}
                        focusId={focusId}
                        showHulls
                        viewTick={viewTick}
                        onBrotherClick={onBrotherClick}
                        onBackgroundClick={onBackgroundClick}
                        onHoverFamily={setHoverFamily}
                    />
                )}
            </div>
            {/* ponytail: scroll target so the canvas lands in the viewport, then RF re-fits */}
            <span ref={belowCanvasRef} className="block h-px w-full" aria-hidden="true" />
        </PageContainer>
    );
}
