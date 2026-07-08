import { useState, useEffect, useRef } from "react";
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
    const blobUrlsRef = useRef(/** @type {string[]} */ ([]));
    const cancelledRef = useRef(false);

    function trackBlobUrl(url) {
        if (isBlobUrl(url)) blobUrlsRef.current.push(url);
        return url;
    }

    async function loadBrothersImages() {
        const modules = import.meta.glob('../assets/portraits/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const entries = await Promise.all(
            Object.values(modules).map(async (module) => {
                const url = module.default;
                const fileName = url.substring(
                    url.lastIndexOf('/') + 1,
                    url.lastIndexOf('.')
                );
                const canonicalName = decodeURIEncodedString(fileName).split('-')[0];
                const compressedUrl = trackBlobUrl(await compressImageUrl(url, "portrait"));
                return [canonicalName, compressedUrl];
            })
        );

        const imageMap = Object.fromEntries(entries);
        if (!cancelledRef.current) setImages(imageMap);
    }

    async function loadHomeImages() {
        const modules = import.meta.glob('../assets/home/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = await Promise.all(
            Object.values(modules).map(async (module) =>
                trackBlobUrl(await compressImageUrl(module.default, "hero"))
            )
        );
        if (!cancelledRef.current) setHomeImages(imageUrls);
    }

    async function loadRushImages() {
        const modules = import.meta.glob('../assets/rush/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = await Promise.all(
            Object.values(modules).map(async (module) =>
                trackBlobUrl(await compressImageUrl(module.default, "hero"))
            )
        );
        if (!cancelledRef.current) setRushImages(imageUrls);
    }

    async function loadBrothersDataCsv() {
        const res = await fetch("/api/datasets/brothers");
        const payload = await res.json();
        const csvText = payload.csvText;

        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const brothersFromCsv = results.data.map(brother => {
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
                brother.hobbies?.split(",") ?? [],
                brother.bigsNames?.split(",") ?? [],
                brother.littlesNames?.split(",") ?? [],
                brother.crossingClass,
                brother.minor,
                brother.family,
                brother.PM,
                brother.PD,
                brother.lineNumber
            );
        });

        brothersFromCsv.forEach(brother => {
            const bigBrothers = brother.bigsNames.map(name => brothersFromCsv.find(b => b.lineName === name)).filter(b => b);
            const littleBrothers = brother.littlesNames.map(name => brothersFromCsv.find(b => b.lineName === name)).filter(b => b);
            brother.setBig(bigBrothers);
            brother.setLittle(littleBrothers);
        });

        // single state update (important for performance)
        setBrothers(brothersFromCsv);
    }

    useEffect(() => {
        cancelledRef.current = false;

        async function loadAll() {
            await loadBrothersDataCsv();
            if (cancelledRef.current) return;
            await Promise.all([loadBrothersImages(), loadHomeImages(), loadRushImages()]);
        }

        loadAll().catch((err) => console.error(err));

        return () => {
            cancelledRef.current = true;
            blobUrlsRef.current.forEach(revokeBlobUrl);
            blobUrlsRef.current = [];
        };
    }, []);

    useEffect(() => {
        // Lightweight preload: just the first hero image(s) to avoid a flash on initial render.
        const heroCandidates = [
            homeImages?.[0],
            rushImages?.[0],
        ].filter(Boolean);

        heroCandidates.forEach((url) => {
            const img = new Image();
            img.src = url;
        });
    }, [homeImages, rushImages]);

    return (
        <BrothersContext.Provider value={{ brothers, setBrothers, images, setImages, homeImages, setHomeImages, rushImages, setRushImages }}>
            {children}
        </BrothersContext.Provider>
    );
};