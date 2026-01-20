import Title from "../components/Title"
import CustomSelect from "../components/Select"
import { useState } from "react"
import FamilyTreeCanvas from "../components/FamilyTreeCanvas";

export default function FamilyTree() {
    const [family, setFamily] = useState("All Families");
    return (
        <div className="pt-40 pl-15 h-full w-full flex flex-col items-start">
            <Title text="Family Tree" />
            <div className="w-full h-fit p-5">
                <CustomSelect
                    value={family}
                    onChange={(val) => setFamily(val)}
                    options={[
                        { value: "All Families", label: "All Families" },
                        { value: "Bounce Back", label: "Bounce Back" },
                        { value: "Olympus", label: "Olympus" },
                    ]}
                />
            </div>
            <div className="h-full w-full mb-10">
                <FamilyTreeCanvas />
            </div>
        </div>
    )
}