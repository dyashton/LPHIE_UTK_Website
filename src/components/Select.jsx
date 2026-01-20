import { useState } from "react";

export default function CustomSelect({ options, value, onChange }) {
    const [open, setOpen] = useState(false);

    const selected = options.find(o => o.value === value);

    return (
        <div className="relative w-64">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex justify-between items-center px-4 py-2 rounded-lg border border-accent bg-background"
            >
                <span>{selected?.label ?? "Select..."}</span>
                <span className="text-xs">▼</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full mt-2 w-full rounded-lg border border-accent bg-background shadow-lg z-10">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-secondary ${value == opt.value ? "font-bold" : ""}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
