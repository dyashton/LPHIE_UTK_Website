import { useState, useEffect, createContext } from "react";

export const BrothersContext = createContext(null);

export default function BrothersProvider({ children }) {
    const [brothers, setBrothers] = useState([]);

    function loadBrothersData() {
        fetch('/data/brothers.json')
            .then(response => response.json())
            .then(data => setBrothers(data.brothers))
            .catch(error => console.error("Error loading brothers data:", error));
    }
    useEffect(() => {
        loadBrothersData();

    }, []);

    return (
        <BrothersContext.Provider value={{ brothers, setBrothers }}>
            {children}
        </BrothersContext.Provider>
    );
};