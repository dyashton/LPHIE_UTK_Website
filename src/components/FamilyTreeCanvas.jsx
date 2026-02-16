import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import FamilyTreeNode from "./FamilyTreeNode";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;

const nodeTypes = {
    familyTreeNode: FamilyTreeNode,
};

function layout(nodes, edges) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB" });

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

function treeToGraph(roots, hoverUni, hoverFamily) {
    const nodeMap = new Map();
    const edgeSet = new Set();

    function traverse(node, hoverUni, hoverFamily) {
        if (!node || !node.id) return;
        // Add node if not seen
        if (!nodeMap.has(node.id)) {
            nodeMap.set(node.id, {
                id: node.id,
                type: "familyTreeNode",
                data: {
                    label: node.label,
                    school: node.school,
                    family: node.family,
                    hoverUni: hoverUni,
                    hoverFamily: hoverFamily,
                },
            });
        }

        // Add children + edges
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

                traverse(child, hoverUni, hoverFamily);
            });
        }
    }

    roots.forEach((root) => traverse(root, hoverUni, hoverFamily));

    return {
        nodes: Array.from(nodeMap.values()),
        edges: Array.from(edgeSet).map(JSON.parse),
    };
}

export default function FamilyTreeCanvas({ treeData, hoverUni, hoverFamily }) {
    const { nodes, edges } = useMemo(() => {
        if (!Array.isArray(treeData) || treeData.length === 0) {
            return { nodes: [], edges: [] };
        }

        const graph = treeToGraph(treeData, hoverUni, hoverFamily);
        return {
            nodes: layout(graph.nodes, graph.edges),
            edges: graph.edges,
        };
    }, [treeData, hoverUni, hoverFamily]);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                nodesConnectable={false}
                nodesDraggable={false}
                fitView
            >
                <MiniMap />
                <Controls />
            </ReactFlow>
        </div>
    );
}
