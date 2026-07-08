import Title from "../components/Title";
import CustomSelect from "../components/Select";
import FamilyTreeCanvas from "../components/FamilyTreeCanvas";
import { useState, useEffect, useContext, useMemo } from "react";
import { BrothersContext } from "../providers/BrothersContext";
import Papa from "papaparse";
import PageContainer from "../components/PageContainer";


/**
 * Convert flat rows into parent → children tree
 */
function buildTree(rows) {
    if (!rows || rows.length === 0) return [];
    const nodes = {};
    const roots = [];

    // Create node for each brother
    rows.forEach((row) => {
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
        return buildTree(filtered);
    }, [rawRows, family]);

    return (
        <PageContainer className="pb-10 pt-20" maxWidthClassName="max-w-7xl">
            <Title as="h1" text="Family Tree" />

            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="w-full lg:w-auto">
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

                <div className="flex flex-col sm:flex-row gap-6 text-sm sm:text-base text-text-primary">
                    <div className="flex flex-col gap-2">
                        {["UTK", "NCSU", "UNC Charlotte", "UNC Chapel Hill", "UGA", "Vanderbilt", "Duke", "UCF"].map((uni) => (
                            <button
                                key={uni}
                                type="button"
                                className="flex items-center gap-2 text-left hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                onMouseEnter={() => setHoverUni(uni)}
                                onMouseLeave={() => setHoverUni("")}
                                onFocus={() => setHoverUni(uni)}
                                onBlur={() => setHoverUni("")}
                            >
                                <div className={`w-3.5 h-3.5 ${uni === "UTK" ? "bg-ut-orange" :
                                    uni === "NCSU" ? "bg-ncsu-red" :
                                        uni === "UNC Charlotte" ? "bg-unc-charlotte-green" :
                                            uni === "UNC Chapel Hill" ? "bg-unc-blue" :
                                                uni === "UGA" ? "bg-uga-red" :
                                                    uni === "Vanderbilt" ? "bg-vandy-gold" :
                                                        uni === "Duke" ? "bg-duke-blue" :
                                                            "bg-ucf-gold"
                                    }`}
                                />
                                <span>{uni}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2">
                        {["Bounce Back", "Olympus", "Uji", "Flight Club"].map((fam) => (
                            <button
                                key={fam}
                                type="button"
                                className="flex items-center gap-2 text-left hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                                onMouseEnter={() => setHoverFamily(fam)}
                                onMouseLeave={() => setHoverFamily("")}
                                onFocus={() => setHoverFamily(fam)}
                                onBlur={() => setHoverFamily("")}
                            >
                                <div className="w-3.5 h-3.5 bg-text-primary/30" />
                                <span>{fam}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-[70vh] sm:h-[75vh] lg:h-[78vh] w-full mt-6 border border-tertiary/30 bg-primary/40">
                <FamilyTreeCanvas treeData={treeData} hoverUni={hoverUni} hoverFamily={hoverFamily} />
            </div>
        </PageContainer>
    );
}
