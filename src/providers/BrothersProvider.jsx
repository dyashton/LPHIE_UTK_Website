import { useState, useEffect } from "react";
import Papa from "papaparse";
import Brother from "../model/Brother";
import { decodeURIEncodedString } from "../utils/utils";
import { BrothersContext } from "./BrothersContext";



export default function BrothersProvider({ children }) {
    const [brothers, setBrothers] = useState([]);
    const [images, setImages] = useState({});
    const [homeImages, setHomeImages] = useState([]);
    const [rushImages, setRushImages] = useState([]);

    async function loadBrothersDataCsv() {
        const res = await fetch("/api/datasets/brothers");
        const payload = await res.json();
        const csvText = payload.csvText;

        const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        console.log("CSV Data:", results.data);
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

    function loadBrothersImages() {
        const images = import.meta.glob('../assets/portraits/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = Object.values(images).map(module => module.default);

        const imageMap = {};
        imageUrls.forEach(url => {
            const fileName = url.substring(
                url.lastIndexOf('/') + 1,
                url.lastIndexOf('.')
            ); // Get filename without extension

            const canonicalName = decodeURIEncodedString(fileName).split('-')[0];
            imageMap[canonicalName] = url;
        });

        setImages(imageMap);
    }

    function loadHomeImages() {
        const images = import.meta.glob('../assets/home/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = Object.values(images).map(module => module.default);
        setHomeImages(imageUrls);
    }

    function loadRushImages() {
        const images = import.meta.glob('../assets/rush/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = Object.values(images).map(module => module.default);
        setRushImages(imageUrls);
    }


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadBrothersDataCsv();
        loadBrothersImages();
        loadHomeImages();
        loadRushImages();
    }, []);

    useEffect(() => {
        console.log("Brothers data loaded:", brothers);
        console.log("Images loaded:", images);
        console.log("Home Images loaded:", homeImages);
        console.log("Rush Images loaded:", rushImages);
    }, [brothers, images, homeImages, rushImages]);

    useEffect(() => {
        Object.values(images).forEach(url => {
            const img = new Image();
            img.src = url; // forces the browser to load the image immediately
        });

        homeImages.forEach(url => {
            const img = new Image();
            img.src = url;
        });

        rushImages.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [images, homeImages, rushImages]);

    return (
        <BrothersContext.Provider value={{ brothers, setBrothers, images, setImages, homeImages, setHomeImages, rushImages, setRushImages }}>
            {children}
        </BrothersContext.Provider>
    );
};