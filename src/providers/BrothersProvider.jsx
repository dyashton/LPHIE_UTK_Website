import { useState, useEffect, useRef, useMemo } from "react";
import Papa from "papaparse";
import Brother from "../model/Brother";
import { decodeURIEncodedString } from "../utils/utils";
import { compressImageUrl, isBlobUrl, revokeBlobUrl } from "../utils/compressImage";
import { BrothersContext } from "./BrothersContext";

export default function BrothersProvider({ children }) {
    const [brothers, setBrothers] = useState([]);
    const [images, setImages] = useState({});
    const [homeImages, setHomeImages] = useState([]);
    const [rushImages, setRushImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const blobUrlsRef = useRef(/** @type {string[]} */ ([]));
    const cancelledRef = useRef(false);

    const galleryImages = useMemo(
        () => [...(homeImages || []), ...(rushImages || [])],
        [homeImages, rushImages]
    );

    function trackBlobUrl(url) {
        if (isBlobUrl(url)) blobUrlsRef.current.push(url);
        return url;
    }

    function portraitNameFromUrl(url) {
        const fileName = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        return decodeURIEncodedString(fileName).split("-")[0];
    }

    /** Show originals immediately; swap in compressed versions one-by-one. */
    async function loadBrothersImages() {
        const modules = import.meta.glob("../assets/portraits/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });

        /** @type {Record<string, string>} */
        const initial = {};
        const jobs = Object.values(modules).map((module) => {
            const url = module.default;
            const name = portraitNameFromUrl(url);
            initial[name] = url;
            return { name, url };
        });

        if (!cancelledRef.current) setImages(initial);

        await Promise.all(
            jobs.map(async ({ name, url }) => {
                const compressed = trackBlobUrl(await compressImageUrl(url, "portrait"));
                if (cancelledRef.current) return;
                setImages((prev) => {
                    const prevUrl = prev[name];
                    if (prevUrl && prevUrl !== compressed && isBlobUrl(prevUrl)) {
                        revokeBlobUrl(prevUrl);
                    }
                    return { ...prev, [name]: compressed };
                });
            })
        );
    }

    async function loadHomeImages() {
        const modules = import.meta.glob("../assets/home/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });
        const originals = Object.values(modules).map((module) => module.default);
        if (!cancelledRef.current) setHomeImages(originals);

        await Promise.all(
            originals.map(async (url, index) => {
                const compressed = trackBlobUrl(await compressImageUrl(url, "hero"));
                if (cancelledRef.current) return;
                setHomeImages((prev) => {
                    const next = [...prev];
                    const prevUrl = next[index];
                    if (prevUrl && prevUrl !== compressed && isBlobUrl(prevUrl)) {
                        revokeBlobUrl(prevUrl);
                    }
                    next[index] = compressed;
                    return next;
                });
            })
        );
    }

    async function loadRushImages() {
        const modules = import.meta.glob("../assets/rush/*.{png,jpg,jpeg,svg}", {
            eager: true,
        });
        const originals = Object.values(modules).map((module) => module.default);
        if (!cancelledRef.current) setRushImages(originals);

        await Promise.all(
            originals.map(async (url, index) => {
                const compressed = trackBlobUrl(await compressImageUrl(url, "hero"));
                if (cancelledRef.current) return;
                setRushImages((prev) => {
                    const next = [...prev];
                    const prevUrl = next[index];
                    if (prevUrl && prevUrl !== compressed && isBlobUrl(prevUrl)) {
                        revokeBlobUrl(prevUrl);
                    }
                    next[index] = compressed;
                    return next;
                });
            })
        );
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
                .map((name) => brothersFromCsv.find((b) => b.lineName === name))
                .filter((b) => b);
            const littleBrothers = brother.littlesNames
                .map((name) => brothersFromCsv.find((b) => b.lineName === name))
                .filter((b) => b);
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
                // CSV ready → page can render; images stream in progressively
                setLoading(false);
                await Promise.all([loadBrothersImages(), loadHomeImages(), loadRushImages()]);
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
            blobUrlsRef.current.forEach(revokeBlobUrl);
            blobUrlsRef.current = [];
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
