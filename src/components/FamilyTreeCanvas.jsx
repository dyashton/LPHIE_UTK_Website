import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider,
    useReactFlow,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { createPortal } from "react-dom";
import FamilyTreeNode, { FamilyHullNode } from "./FamilyTreeNode";
import BrotherHoverCard from "./BrotherHoverCard";
import { FAMILIES, FAMILY_ACCENT, REVEAL_MS_PER_DEPTH, resolveTreeEnrich } from "../utils/familyTree";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const HULL_PAD = 36;
const QUADRANT_GAP = 160;

const nodeTypes = {
    familyTreeNode: FamilyTreeNode,
    familyHull: FamilyHullNode,
};

function layout(nodes, edges) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 70 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
        const { x, y } = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: x - NODE_WIDTH / 2,
                y: y - NODE_HEIGHT / 2,
            },
        };
    });
}

/** Layout each family independently, then park them in TL / TR / BL / BR quadrants. */
function layoutInQuadrants(nodes, edges) {
    const byFamily = new Map();
    for (const node of nodes) {
        const fam = node.data.family || "Other";
        if (!byFamily.has(fam)) byFamily.set(fam, []);
        byFamily.get(fam).push(node);
    }

    const familyOrder = [
        ...FAMILIES.filter((f) => byFamily.has(f)),
        ...[...byFamily.keys()].filter((f) => !FAMILIES.includes(f)),
    ];

    const laidFamilies = [];

    for (const family of familyOrder) {
        const famNodes = byFamily.get(family) || [];
        if (!famNodes.length) continue;
        const ids = new Set(famNodes.map((n) => n.id));
        const famEdges = edges.filter(
            (e) => ids.has(e.source) && ids.has(e.target)
        );
        const laid = layout(famNodes, famEdges);

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const n of laid) {
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
            maxY = Math.max(maxY, n.position.y + NODE_HEIGHT);
        }

        const normalized = laid.map((n) => ({
            ...n,
            position: {
                x: n.position.x - minX,
                y: n.position.y - minY,
            },
        }));
        laidFamilies.push({
            family,
            nodes: normalized,
            width: maxX - minX,
            height: maxY - minY,
        });
    }

    // Quadrant slots: 0 TL, 1 TR, 2 BL, 3 BR
    const slot = (i) => laidFamilies[i] || { width: 0, height: 0, nodes: [] };
    const col0W = Math.max(slot(0).width, slot(2).width, 0);
    const row0H = Math.max(slot(0).height, slot(1).height, 0);
    const row1H = Math.max(slot(2).height, slot(3).height, 0);

    const origins = [
        { x: 0, y: 0 },
        { x: col0W + QUADRANT_GAP, y: 0 },
        { x: 0, y: row0H + QUADRANT_GAP },
        { x: col0W + QUADRANT_GAP, y: row0H + QUADRANT_GAP },
    ];
    const cellW = [col0W, Math.max(slot(1).width, slot(3).width, 0), col0W, Math.max(slot(1).width, slot(3).width, 0)];
    const cellH = [row0H, row0H, row1H, row1H];

    const positioned = [];
    laidFamilies.forEach((fam, i) => {
        const origin = origins[i] || {
            x: (i % 2) * (col0W + QUADRANT_GAP),
            y: Math.floor(i / 2) * (row0H + QUADRANT_GAP),
        };
        const ox = origin.x + Math.max(0, ((cellW[i] ?? fam.width) - fam.width) / 2);
        const oy = origin.y + Math.max(0, ((cellH[i] ?? fam.height) - fam.height) / 2);
        for (const n of fam.nodes) {
            positioned.push({
                ...n,
                position: {
                    x: n.position.x + ox,
                    y: n.position.y + oy,
                },
            });
        }
    });

    return positioned;
}

function treeToGraph(roots, enrich) {
    const nodeMap = new Map();
    const edgeSet = new Set();
    let maxDepth = 0;

    function traverse(node, depth) {
        if (!node?.id) return;
        maxDepth = Math.max(maxDepth, depth);

        if (!nodeMap.has(node.id)) {
            const kids = Array.isArray(node.children) ? node.children : [];
            const resolved = resolveTreeEnrich(enrich || {}, node.id, node.label);
            nodeMap.set(node.id, {
                id: node.id,
                type: "familyTreeNode",
                style: { overflow: "visible", width: NODE_WIDTH, height: NODE_HEIGHT },
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                data: {
                    id: node.id,
                    brotherLinkId: resolved.profile?.lineName || node.id,
                    label: node.label,
                    school: node.school,
                    family: node.family,
                    depth,
                    parentLabel: node.parentLabel || null,
                    childrenLabels: kids.map((c) => c.label).filter(Boolean),
                    imgSrc: resolved.imgSrc,
                    hasBrotherProfile: resolved.hasBrotherProfile,
                },
            });
        }

        if (Array.isArray(node.children)) {
            node.children.forEach((child) => {
                if (!child?.id) return;
                edgeSet.add(
                    JSON.stringify({
                        id: `e-${node.id}-${child.id}`,
                        source: node.id,
                        target: child.id,
                        type: "smoothstep",
                    })
                );
                traverse(child, depth + 1);
            });
        }
    }

    roots.forEach((root) => traverse(root, 0));

    return {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeSet).map(JSON.parse),
        maxDepth,
    };
}

function buildHulls(brotherNodes) {
    const byFamily = new Map();
    for (const node of brotherNodes) {
        const fam = node.data.family;
        if (!fam) continue;
        if (!byFamily.has(fam)) byFamily.set(fam, []);
        byFamily.get(fam).push(node);
    }

    const hulls = [];
    for (const [family, nodes] of byFamily) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const n of nodes) {
            minX = Math.min(minX, n.position.x);
            minY = Math.min(minY, n.position.y);
            maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
            maxY = Math.max(maxY, n.position.y + NODE_HEIGHT);
        }
        const width = maxX - minX + HULL_PAD * 2;
        const height = maxY - minY + HULL_PAD * 2;
        hulls.push({
            id: `hull-${family}`,
            type: "familyHull",
            position: { x: minX - HULL_PAD, y: minY - HULL_PAD },
            data: { family, width, height },
            style: { width, height, pointerEvents: "none" },
            width,
            height,
            selectable: false,
            draggable: false,
            connectable: false,
            focusable: false,
            zIndex: -1,
        });
    }
    return hulls;
}

function applyHighlights({
    brotherNodes,
    edges,
    hulls,
    hoverUni,
    hoverFamily,
    focusedFamily,
    spotlightIds,
    focusId,
    showHulls,
}) {
    const hasSpotlight = spotlightIds && spotlightIds.size > 0;
    const activeFamily = hoverFamily || focusedFamily || "";
    const hasLegend = Boolean(hoverUni || activeFamily);
    const byId = new Map(brotherNodes.map((n) => [n.id, n.data]));

    const nodeHighlighted = (data) => {
        if (hasSpotlight) return spotlightIds.has(data.id);
        if (activeFamily) return data.family === activeFamily;
        if (hoverUni) return data.school === hoverUni;
        return false;
    };

    const nodeDimmed = (data) => {
        if (hasSpotlight) return !spotlightIds.has(data.id);
        if (activeFamily) return data.family !== activeFamily;
        if (hoverUni) return data.school !== hoverUni;
        return false;
    };

    const highlightKind = hasSpotlight
        ? "spotlight"
        : activeFamily
          ? "family"
          : hoverUni
            ? "school"
            : null;

    const styledBrothers = brotherNodes.map((node) => {
        const highlighted = nodeHighlighted(node.data);
        const dimmed = nodeDimmed(node.data);
        return {
            ...node,
            zIndex: 1000,
            data: {
                ...node.data,
                highlighted,
                dimmed,
                highlightKind: highlighted ? highlightKind : null,
                isFocus: focusId === node.id,
            },
            className: dimmed ? "family-tree-dim" : undefined,
        };
    });

    const styledEdges = edges.map((edge) => {
        const src = byId.get(edge.source);
        const tgt = byId.get(edge.target);
        const srcOn =
            !hasSpotlight && !hasLegend
                ? false
                : hasSpotlight
                  ? spotlightIds.has(edge.source) && spotlightIds.has(edge.target)
                  : activeFamily
                    ? src?.family === activeFamily && tgt?.family === activeFamily
                    : hoverUni
                      ? src?.school === hoverUni && tgt?.school === hoverUni
                      : false;

        const fam = src?.family || tgt?.family;
        const accent = FAMILY_ACCENT[fam]?.edge || "var(--accent-color)";

        if (srcOn) {
            return {
                ...edge,
                animated: true,
                className: "family-tree-edge-hl",
                style: {
                    stroke: hasSpotlight ? "var(--accent-color)" : accent,
                    strokeWidth: 2.5,
                },
            };
        }

        if (hasSpotlight || hasLegend) {
            return {
                ...edge,
                animated: false,
                className: undefined,
                style: { stroke: "var(--tertiary-color)", strokeWidth: 1, opacity: 0.25 },
            };
        }

        return {
            ...edge,
            animated: false,
            className: undefined,
            style: { stroke: "var(--tertiary-color)", strokeWidth: 1.5, opacity: 0.7 },
        };
    });

    const styledHulls =
        showHulls && !hasSpotlight
            ? hulls.map((h) => ({
                  ...h,
                  data: {
                      ...h.data,
                      highlighted: Boolean(activeFamily && h.data.family === activeFamily),
                      dimmed: activeFamily ? h.data.family !== activeFamily : false,
                  },
              }))
            : [];

    return {
        nodes: [...styledHulls, ...styledBrothers],
        edges: styledEdges,
    };
}

function FamilyTreeFlow({
    treeData,
    enrich,
    hoverUni,
    hoverFamily,
    focusedFamily = "",
    zoomNonce = 0,
    spotlightIds,
    focusId,
    showHulls,
    viewTick = 0,
    onBrotherClick,
    onBackgroundClick,
    onHoverFamily,
}) {
    const { fitView, getNodes, screenToFlowPosition } = useReactFlow();
    const focusIdRef = useRef(focusId);
    focusIdRef.current = focusId;
    const focusedFamilyRef = useRef(focusedFamily);
    focusedFamilyRef.current = focusedFamily;
    const didInitialFit = useRef(false);
    const [hoverCard, setHoverCard] = useState(null);
    const hoverCloseTimer = useRef(null);

    const keepHoverCard = useCallback(() => {
        clearTimeout(hoverCloseTimer.current);
    }, []);

    const showBrotherCard = useCallback((event, node) => {
        clearTimeout(hoverCloseTimer.current);
        const nodeEl =
            event.target?.closest?.(".react-flow__node") ||
            event.currentTarget?.closest?.(".react-flow__node");
        if (nodeEl) nodeEl.style.zIndex = "10000";
        const r = (nodeEl || event.target)?.getBoundingClientRect?.();
        if (!r || r.width === 0) {
            // Fallback: center of canvas if rect missing
            setHoverCard({
                data: node.data,
                nodeId: node.id,
                top: event.clientY + 12,
                left: event.clientX,
            });
            return;
        }
        setHoverCard({
            data: node.data,
            nodeId: node.id,
            top: r.bottom + 8,
            left: r.left + r.width / 2,
        });
    }, []);

    const scheduleHideHoverCard = useCallback(() => {
        clearTimeout(hoverCloseTimer.current);
        hoverCloseTimer.current = setTimeout(() => {
            if (hoverCard?.nodeId) {
                const el = document.querySelector(
                    `.react-flow__node[data-id="${CSS.escape(hoverCard.nodeId)}"]`
                );
                if (el) el.style.zIndex = "";
            }
            setHoverCard(null);
        }, 150);
    }, [hoverCard?.nodeId]);

    // Keep card glued while open (pan/zoom)
    useEffect(() => {
        if (!hoverCard?.nodeId) return;
        const tick = () => {
            const el = document.querySelector(
                `.react-flow__node[data-id="${CSS.escape(hoverCard.nodeId)}"]`
            );
            if (!el) return;
            const r = el.getBoundingClientRect();
            setHoverCard((prev) =>
                prev
                    ? { ...prev, top: r.bottom + 8, left: r.left + r.width / 2 }
                    : null
            );
        };
        const id = window.setInterval(tick, 50);
        return () => window.clearInterval(id);
    }, [hoverCard?.nodeId]);

    useEffect(() => () => clearTimeout(hoverCloseTimer.current), []);

    const { brotherNodes, edges, maxDepth, hulls } = useMemo(() => {
        if (!Array.isArray(treeData) || treeData.length === 0) {
            return { brotherNodes: [], edges: [], maxDepth: 0, hulls: [] };
        }
        const graph = treeToGraph(treeData, enrich);
        const laid = showHulls
            ? layoutInQuadrants(graph.nodes, graph.edges)
            : layout(graph.nodes, graph.edges);
        return {
            brotherNodes: laid,
            edges: graph.edges,
            maxDepth: graph.maxDepth,
            hulls: showHulls ? buildHulls(laid) : [],
        };
    }, [treeData, enrich, showHulls]);

    const { nodes, edges: styledEdges } = useMemo(
        () =>
            applyHighlights({
                brotherNodes,
                edges,
                hulls,
                hoverUni,
                hoverFamily,
                focusedFamily,
                spotlightIds,
                focusId,
                showHulls,
            }),
        [
            brotherNodes,
            edges,
            hulls,
            hoverUni,
            hoverFamily,
            focusedFamily,
            spotlightIds,
            focusId,
            showHulls,
        ]
    );

    const zoomToFamily = useCallback(
        (fam, duration = 850) => {
            // Prefer live RF nodes (have measured width/height) when available
            const live = getNodes();
            const source = live.length ? live : [...brotherNodes, ...hulls];

            if (!fam) {
                fitView({
                    nodes: source.map((n) => ({ id: n.id })),
                    padding: 0.2,
                    duration,
                    minZoom: 0.1,
                    maxZoom: 2,
                });
                return;
            }

            const targets = source.filter((n) => n.data?.family === fam);
            if (!targets.length) {
                fitView({
                    nodes: source.map((n) => ({ id: n.id })),
                    padding: 0.2,
                    duration,
                });
                return;
            }
            fitView({
                nodes: targets.map((n) => ({ id: n.id })),
                padding: 0.2,
                duration,
                minZoom: 0.1,
                maxZoom: 2,
            });
        },
        [brotherNodes, hulls, fitView, getNodes]
    );

    // One-time open: wait for cascade, then frame the full tree
    useEffect(() => {
        if (!brotherNodes.length || didInitialFit.current) return;
        didInitialFit.current = true;

        const delay = maxDepth * REVEAL_MS_PER_DEPTH + 280;
        const t = setTimeout(() => {
            const id = focusIdRef.current;
            const fam = focusedFamilyRef.current;
            if (id) {
                fitView({
                    nodes: [{ id }],
                    padding: 0.45,
                    duration: 400,
                    maxZoom: 1.15,
                });
            } else {
                zoomToFamily(fam || "", 400);
            }
        }, delay);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brotherNodes.length, maxDepth]);

    // User-driven family zoom in / out (nonce bumps on every legend/canvas/dropdown select)
    useEffect(() => {
        if (!zoomNonce || !brotherNodes.length) return;
        const t = setTimeout(() => {
            zoomToFamily(focusedFamily || "", 850);
        }, 30);
        return () => clearTimeout(t);
    }, [zoomNonce, focusedFamily, zoomToFamily, brotherNodes.length]);

    // After the page scrolls the canvas into view (load only)
    useEffect(() => {
        if (!viewTick || !brotherNodes.length) return;
        const t = requestAnimationFrame(() => {
            zoomToFamily(focusedFamilyRef.current || "", 0);
        });
        return () => cancelAnimationFrame(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewTick]);

    // ponytail: no fitView on spotlight — lineage highlight stays in place once zoomed into the family

    return (
        <>
        <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            nodeTypes={nodeTypes}
            nodesConnectable={false}
            nodesDraggable={false}
            elementsSelectable
            onNodeClick={(_, node) => {
                if (node.type === "familyHull") return;
                setHoverCard(null);
                onBrotherClick?.(node.id);
            }}
            onNodeMouseEnter={(event, node) => {
                if (node.type === "familyHull") return;
                showBrotherCard(event, node);
            }}
            onNodeMouseLeave={(_, node) => {
                if (node.type === "familyHull") return;
                scheduleHideHoverCard();
            }}
            onPaneMouseMove={(event) => {
                try {
                    const pos = screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    });
                    const hit = hulls.find((h) => {
                        const x = h.position.x;
                        const y = h.position.y;
                        const w = h.width ?? h.data?.width ?? 0;
                        const ht = h.height ?? h.data?.height ?? 0;
                        return (
                            pos.x >= x &&
                            pos.x <= x + w &&
                            pos.y >= y &&
                            pos.y <= y + ht
                        );
                    });
                    onHoverFamily?.(hit?.data?.family || "");
                } catch {
                    /* ignore */
                }
            }}
            onPaneClick={(event) => {
                setHoverCard(null);
                try {
                    const pos = screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    });
                    const hit = hulls.find((h) => {
                        const x = h.position.x;
                        const y = h.position.y;
                        const w = h.width ?? h.data?.width ?? 0;
                        const ht = h.height ?? h.data?.height ?? 0;
                        return (
                            pos.x >= x &&
                            pos.x <= x + w &&
                            pos.y >= y &&
                            pos.y <= y + ht
                        );
                    });
                    onBackgroundClick?.(hit?.data?.family || "");
                } catch {
                    onBackgroundClick?.("");
                }
            }}
            onMoveStart={() => setHoverCard(null)}
            onInit={(instance) => {
                instance.fitView({ padding: 0.2 });
            }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
        >
            <Background color="var(--tertiary-color)" gap={22} size={1} style={{ opacity: 0.25 }} />
            <MiniMap
                nodeColor={(n) => {
                    if (n.type === "familyHull") return "transparent";
                    return FAMILY_ACCENT[n.data?.family]?.hex || "var(--secondary-color)";
                }}
                maskColor="rgba(33,33,33,0.7)"
            />
            <Controls />
        </ReactFlow>
        {hoverCard &&
            createPortal(
                <BrotherHoverCard
                    data={hoverCard.data}
                    top={hoverCard.top}
                    left={hoverCard.left}
                    onEnter={keepHoverCard}
                    onLeave={scheduleHideHoverCard}
                />,
                document.body
            )}
        </>
    );
}

export default function FamilyTreeCanvas(props) {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlowProvider>
                <FamilyTreeFlow {...props} />
            </ReactFlowProvider>
        </div>
    );
}
