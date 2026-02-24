import { useState, useEffect, createContext, use } from "react";
import Papa from "papaparse";
import Brother from "../model/Brother";
import { decodeURIEncodedString } from "../utils/utils";



export const BrothersContext = createContext(null);

export default function BrothersProvider({ children }) {
    const [brothers, setBrothers] = useState([]);
    const [images, setImages] = useState({});
    const [homeImages, setHomeImages] = useState([]);
    const [rushImages, setRushImages] = useState([]);

    function loadBrothersData() {
        fetch('/data/brothers.json')
            .then(response => response.json())
            .then(data => setBrothers(data.brothers))
            .catch(error => console.error("Error loading brothers data:", error));
    }

    function loadBrothersDataCsv() {
        Papa.parse("/data/brotherdata.csv", {
            download: true,
            header: true,
            complete: (results) => {
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
            },
        });
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

            const canonicalName = decodeURIEncodedString(fileName);
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
        const images = import.meta.glob('/src/assets/rush/*.{png,jpg,jpeg,svg}', {
            eager: true
        });

        const imageUrls = Object.values(images).map(module => module.default);
        setRushImages(imageUrls);
    }


    useEffect(() => {
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
    }, [brothers, images]);

    return (
        <BrothersContext.Provider value={{ brothers, setBrothers, images, setImages, homeImages, setHomeImages, rushImages, setRushImages }}>
            {children}
        </BrothersContext.Provider>
    );
};