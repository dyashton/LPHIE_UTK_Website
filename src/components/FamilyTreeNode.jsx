import { Handle, Position } from "reactflow";
export default function FamilyTreeNode({ data }) {
    return (
        <div className="group relative px-4 py-2 rounded-sm border bg-primary shadow transition-all duration-200  hover:shadow-lg">
            <Handle
                type="target"
                position={Position.Top}
                className=""
            />
            <div className="font-semibold text-text-primary">{data.label}</div>

            {/* Hover info */}
            <div className="absolute top-0 right-full -translate-x-1 mt-2 w-max  
                          opacity-0 scale-95 pointer-events-none
                          group-hover:opacity-100
                          transition-all duration-200
                          bg-secondary text-text-primary text-xs px-3 py-1 rounded-sm shadow z-10">
                More info about {data.label}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
            />
        </div>
    );
}