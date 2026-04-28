import Title from "../components/Title";
import CustomSelect from "../components/Select";
import FamilyTreeCanvas from "../components/FamilyTreeCanvas";
import { useState, useEffect, useContext, useMemo } from "react";
import { BrothersContext } from "../providers/BrothersContext";
import Papa from "papaparse";


/**
 * Convert flat rows into parent → children tree
 */
function buildTree(rows) {
    if (!rows || rows.length === 0) return [];
    const nodes = {};
    const roots = [];

    // Create node for each brother
    rows.forEach((row) => {
        console.log("Processing row: ", row);
        const id = row.brother;

        nodes[id] = {
            id: id,
            brother: row.brother,
            parent: row.parent || null,
            school: row.school,
            family: row.family,
            label: row.label,
            children: [],
        };
        console.log("Created node: ", nodes[id]);
    });

    // Link parents → children
    rows.forEach((row) => {
        const childId = row.brother;
        const parentId = row.parent;

        if (parentId && nodes[parentId]) {
            nodes[parentId].children.push(nodes[childId]);
        } else {
            // No parent → root of this family
            roots.push(nodes[childId]);
        }
    });
    console.log("Roots: ", roots)
    return roots;
}

export default function FamilyTree() {
    const [family, setFamily] = useState("All Families");
    const [rawRows, setRawRows] = useState([]);
    const [hoverUni, setHoverUni] = useState("");
    const [hoverFamily, setHoverFamily] = useState("");

    useContext(BrothersContext);

    // Load CSV inside React
    useEffect(() => {
        let cancelled = false;

        async function load() {
            const res = await fetch("/api/datasets/familyTree");
            const payload = await res.json();
            const results = Papa.parse(payload.csvText, { header: true, skipEmptyLines: true });

            console.log("Family Tree CSV Data:", results.data);
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
            console.log("Parsed Rows:", rows);
            if (!cancelled) setRawRows(rows);
        }

        load().catch((err) => console.error(err));
        return () => { cancelled = true; };
    }, []);

    const treeData = useMemo(() => {
        if (!rawRows.length) return [];
        const filtered =
            family === "All Families"
                ? rawRows
                : rawRows.filter((row) => row.family === family);
        console.log("Filtered Rows for Family", family, ":", filtered);
        return buildTree(filtered);
    }, [rawRows, family]);

    return (
        <div className="relative pt-40 pl-15 h-full w-full flex flex-col items-start">
            <Title text="Family Tree" />
            <div className="color-legend absolute top-50 right-30 mb-5 flex flex-col gap-4 z-10">
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("UTK")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-ut-orange bg-ut-orange"></div>
                    <div className="text-3xl text-text-primary">UTK</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("NCSU")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-ncsu-red bg-ncsu-red"></div>
                    <div className="text-3xl text-text-primary">NCSU</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("UNC Charlotte")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-unc-charlotte-green bg-unc-charlotte-green"></div>
                    <div className="text-3xl text-text-primary">UNC Charlotte</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("UNC Chapel Hill")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-unc-blue bg-unc-blue"></div>
                    <div className="text-3xl text-text-primary">UNC Chapel Hill</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("UGA")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-uga-red bg-uga-red"></div>
                    <div className="text-3xl text-text-primary">UGA</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("Vanderbilt")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-vandy-gold bg-vandy-gold"></div>
                    <div className="text-3xl text-text-primary">Vanderbilt</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("Duke")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-duke-blue bg-duke-blue"></div>
                    <div className="text-3xl text-text-primary">Duke</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverUni("UCF")} onMouseLeave={() => setHoverUni("")}>
                    <div className="w-5 h-5 border-ucf-gold bg-ucf-gold"></div>
                    <div className="text-3xl text-text-primary">UCF</div>
                </div>
            </div>
            <div className="absolute top-50 right-120 mb-5 flex flex-col gap-4 z-10">
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverFamily("Bounce Back")} onMouseLeave={() => setHoverFamily("")}>
                    <div className="w-5 h-5 border-border-primary bg-border-primary"></div>
                    <div className="text-3xl text-text-primary">Bounce Back</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverFamily("Olympus")} onMouseLeave={() => setHoverFamily("")}>
                    <div className="w-5 h-5 border-border-primary bg-border-primary"></div>
                    <div className="text-3xl text-text-primary">Olympus</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverFamily("Uji")} onMouseLeave={() => setHoverFamily("")}>
                    <div className="w-5 h-5 border-border-primary bg-border-primary"></div>
                    <div className="text-3xl text-text-primary">Uji</div>
                </div>
                <div className="flex items-center gap-2 cursor-pointer" onMouseEnter={() => setHoverFamily("Flight Club")} onMouseLeave={() => setHoverFamily("")}>
                    <div className="w-5 h-5 border-border-primary bg-border-primary"></div>
                    <div className="text-3xl text-text-primary">Flight Club</div>
                </div>

            </div>
            <div className="w-full h-fit p-5">
                <CustomSelect
                    value={family}
                    onChange={(val) => setFamily(val)}
                    options={[
                        { value: "All Families", label: "All Families" },
                        { value: "Bounce Back", label: "Bounce Back" },
                        { value: "Uji", label: "Uji" },
                        { value: "Flight Club", label: "Flight Club" },
                        { value: "Olympus", label: "Olympus" },
                    ]}
                />
            </div>

            <div className="h-full w-full mb-10">
                {/* Pass real tree structure */}
                <FamilyTreeCanvas
                    treeData={treeData}
                    hoverUni={hoverUni}
                    hoverFamily={hoverFamily}

                />
            </div>
        </div>
    );
}
