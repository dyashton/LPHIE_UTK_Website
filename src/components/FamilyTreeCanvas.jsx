import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import FamilyTreeNode from "./FamilyTreeNode";

function layout(nodes, edges) {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: "TB" }); // top → bottom

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 60 });
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
                x: x - 75, // width / 2
                y: y - 30, // height / 2
            },
        };
    });
}



const nodes = [
    // Level 1 (Top)
    {
        id: "1",
        type: "familyTreeNode",
        data: { label: "Justin" },
        // position: { x: 300, y: 0 },
    },

    // Level 2
    {
        id: "2",
        type: "familyTreeNode",
        data: { label: "Parent A" },
        // position: { x: 150, y: 150 },
    },
    {
        id: "3",
        type: "familyTreeNode",
        data: { label: "Parent B" },
        // position: { x: 450, y: 150 },
    },

    // Level 3
    {
        id: "4",
        type: "familyTreeNode",
        data: { label: "Child A1" },
        // position: { x: 50, y: 300 },
    },
    {
        id: "5",
        type: "familyTreeNode",
        data: { label: "Child A2" },
        // position: { x: 250, y: 300 },
    },
    {
        id: "6",
        type: "familyTreeNode",
        data: { label: "Child B1" },
        // position: { x: 350, y: 300 },
    },
    {
        id: "7",
        type: "familyTreeNode",
        data: { label: "Child B2" },
        // position: { x: 550, y: 300 },
    },
];

const edges = [
    // Grandparent → Parents
    { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
    { id: "e1-3", source: "1", target: "3", type: "smoothstep" },

    // Parent A → Children
    { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
    { id: "e2-5", source: "2", target: "5", type: "smoothstep" },

    // Parent B → Children
    { id: "e3-6", source: "3", target: "6", type: "smoothstep" },
    { id: "e3-7", source: "3", target: "7", type: "smoothstep" },
];

const nodeTypes = {
    familyTreeNode: FamilyTreeNode,
};

const layoutedNodes = layout(nodes, edges);

export default function FamilyTreeCanvas() {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={layoutedNodes}
                edges={edges}
                nodeTypes={nodeTypes}
                nodesConnectable={false}
                nodesDraggable={false}
                fitView
            >
            </ReactFlow>
        </div>
    );
}
