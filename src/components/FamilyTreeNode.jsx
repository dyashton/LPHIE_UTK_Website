import { Handle, Position } from "reactflow";


const colorDict = {
    "UTK": "border-ut-orange text-ut-orange bg-ut-orange/10",
    "NCSU": "border-ncsu-red text-ncsu-red bg-ncsu-red/10",
    "UNC Charlotte": "border-unc-charlotte-green text-unc-charlotte-green bg-unc-charlotte-green/10",
    "UNC Chapel Hill": "border-unc-blue text-unc-blue bg-unc-blue/10",
    "UGA": "border-uga-red text-uga-red bg-uga-red/10",
    "Vanderbilt": "border-vandy-gold text-vandy-gold bg-vandy-gold/10",
    "Duke": "border-duke-blue text-duke-blue bg-duke-blue/10",
    "UCF": "border-ucf-gold text-ucf-gold bg-ucf-gold/10",
    "Default": "border-text-primary text-text-primary",
}

const glowDict = {
    "UTK": "ring-4 ring-ut-orange/50 drop-shadow-[0_0_20px_rgba(255,130,0,0.8)]",
    "NCSU": "ring-4 ring-ncsu-red/50 drop-shadow-[0_0_20px_rgba(204,0,0,0.8)]",
    "UNC Charlotte": "ring-4 ring-unc-charlotte-green/50 drop-shadow-[0_0_20px_rgba(0,153,0,0.8)]",
    "UNC Chapel Hill": "ring-4 ring-unc-blue/50 drop-shadow-[0_0_20px_rgba(75,156,211,0.8)]",
    "UGA": "ring-4 ring-uga-red/50 drop-shadow-[0_0_20px_rgba(186,12,47,0.8)]",
    "Vanderbilt": "ring-4 ring-vandy-gold/50 drop-shadow-[0_0_20px_rgba(198,146,20,0.8)]",
    "Duke": "ring-4 ring-duke-blue/50 drop-shadow-[0_0_20px_rgba(0,48,135,0.8)]",
    "UCF": "ring-4 ring-ucf-gold/50 drop-shadow-[0_0_20px_rgba(255,199,44,0.8)]",
};

export default function FamilyTreeNode({ data }) {
    return (
        <div className={`group relative px-4 py-2 rounded-sm border ${colorDict[data.school] || colorDict["Default"]} shadow transition-all duration-200  hover:shadow-lg w-[200px] h-[60px] ${(data.hoverUni === data.school || data.hoverFamily === data.family) ? glowDict[data.school] || glowDict["Default"] : ''
            } `}>
            <Handle
                type="target"
                position={Position.Top}
                className=""
            />
            <div className="font-semibold text-text-primary text-center text-sm flex items-center justify-center h-full">{data.label}</div>

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