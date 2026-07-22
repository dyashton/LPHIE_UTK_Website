import { useState, useEffect, useRef, useMemo } from "react";
import Papa from "papaparse";
import Brother from "../model/Brother";
import { decodeURIEncodedString } from "../utils/utils";
import { BrothersContext } from "./BrothersContext";

export default function BrothersProvider({ children }) {
    const [brothers, setBrothers] = useState([]);
    const [images, setImages] = useState({});
    const [homeImages, setHomeImages] = useState([]);
    const [rushImages, setRushImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cancelledRef = useRef(false);

    const galleryImages = useMemo(
        () => [...(homeImages || []), ...(rushImages || [])],
        [homeImages, rushImages]
    );

    function portraitNameFromUrl(url) {
        const fileName = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        return decodeURIEncodedString(fileName).split("-")[0];
    }

    // ponytail: assets pre-downsampled via scripts/downsample-assets.mjs — no runtime compress
    function loadBrothersImages() {
        const modules = import.meta.glob("../assets/portraits/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });
        /** @type {Record<string, string>} */
        const map = {};
        for (const module of Object.values(modules)) {
            map[portraitNameFromUrl(module.default)] = module.default;
        }
        if (!cancelledRef.current) setImages(map);
    }

    function loadHomeImages() {
        const modules = import.meta.glob("../assets/home/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });
        if (!cancelledRef.current) {
            setHomeImages(Object.values(modules).map((module) => module.default));
        }
    }

    function loadRushImages() {
        const modules = import.meta.glob("../assets/rush/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });
        if (!cancelledRef.current) {
            setRushImages(Object.values(modules).map((module) => module.default));
        }
    }

    // ponytail: CSV mixes line names ("Kill 'Em All") and full "First \"Line\" Last" — extract either
    function resolveBrotherByName(brothersList, raw) {
        const name = (raw || "").trim();
        if (!name) return null;
        const byLine = brothersList.find((b) => b.lineName === name);
        if (byLine) return byLine;
        const quoted = name.match(/"([^"]+)"/);
        if (quoted) {
            const byQuoted = brothersList.find((b) => b.lineName === quoted[1]);
            if (byQuoted) return byQuoted;
        }
        return brothersList.find((b) => b.getFullName() === name) || null;
    }

    async function loadBrothersDataCsv() {
        const res = await fetch("/api/datasets/brothers");
        if (!res.ok) throw new Error(`Brothers dataset failed (${res.status})`);
        const payload = await res.json();
        const csvText = payload.csvText;

        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const brothersFromCsv = results.data.map((brother) => {
            return new Brother(
                brother.firstName,
                brother.lineName,
                brother.lastName,
                brother.position,
                brother.classYear,
                brother.graduationYear,
                brother.major,
                brother.hometown,
                brother.imageUrl,
                brother.hobbies?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
                brother.bigsNames?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
                brother.littlesNames?.split(",").map((s) => s.trim()).filter(Boolean) ?? [],
                brother.crossingClass,
                brother.minor,
                brother.family,
                brother.PM,
                brother.PD,
                brother.lineNumber
            );
        });

        brothersFromCsv.forEach((brother) => {
            const bigBrothers = brother.bigsNames
                .map((name) => resolveBrotherByName(brothersFromCsv, name))
                .filter(Boolean);
            const littleBrothers = brother.littlesNames
                .map((name) => resolveBrotherByName(brothersFromCsv, name))
                .filter(Boolean);
            brother.setBig(bigBrothers);
            brother.setLittle(littleBrothers);
        });

        setBrothers(brothersFromCsv);
    }

    useEffect(() => {
        cancelledRef.current = false;

        async function loadAll() {
            setLoading(true);
            setError(null);
            try {
                await loadBrothersDataCsv();
                if (cancelledRef.current) return;
                loadBrothersImages();
                loadHomeImages();
                loadRushImages();
                setLoading(false);
            } catch (err) {
                console.error(err);
                if (!cancelledRef.current) {
                    setError(err?.message || "Failed to load chapter data");
                    setLoading(false);
                }
            }
        }

        loadAll();

        return () => {
            cancelledRef.current = true;
        };
    }, []);

    useEffect(() => {
        const heroCandidates = [homeImages?.[0], rushImages?.[0]].filter(Boolean);

        heroCandidates.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    }, [homeImages, rushImages]);

    return (
        <BrothersContext.Provider
            value={{
                brothers,
                setBrothers,
                images,
                setImages,
                homeImages,
                setHomeImages,
                rushImages,
                setRushImages,
                galleryImages,
                loading,
                error,
            }}
        >
            {children}
        </BrothersContext.Provider>
    );
}
