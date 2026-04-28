import Title from "../components/Title"
import { useState, useContext, useEffect } from "react"
import { BrothersContext } from "../providers/BrothersContext"
import { motion, AnimatePresence } from "framer-motion"
import Papa from "papaparse";

const MotionDiv = motion.div;

function displayRushEvents(events) {
    if (!events || events.length === 0) {
        return <p className="pl-20 text-3xl font-cinzel">Rush has ended for this semester. Please check back later or contact us <a href="https://www.instagram.com/utklphie/" target="blank" className="text-accent cursor-pointer">@utklphie</a></p>;
    }
    return events.map((event, index) => (
        <div key={index} className="rush-event mb-8 pl-20 relative">
            <h3 className="text-2xl font-bold">{event.date} - {event.title}</h3>
            <p className="mt-2 text-lg">{event.description}</p>
        </div>
    ));
}

export default function Rush() {
    const [imgIndex, setImgIndex] = useState(0);
    const [upcomingRushEvents, setUpcomingRushEvents] = useState([]);
    const { rushImages } = useContext(BrothersContext);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const res = await fetch("/api/datasets/rush");
            const payload = await res.json();
            const results = Papa.parse(payload.csvText, { header: true, skipEmptyLines: true });
            const events = results.data.map((item) => ({
                date: item.date,
                title: item.title,
                description: item.description,
            }));
            if (!cancelled) setUpcomingRushEvents(events);
        }

        load().catch((err) => console.error(err));
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!rushImages.length) return;
        const interval = setInterval(() => {
            setImgIndex((prevIndex) => (prevIndex + 1) % rushImages.length);
        }, 5000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [rushImages]);
    return (
        <div className="w-full h-full relative">
            <Title text="Rush" className="absolute top-40 left-15 z-20" />
            <div className="relative w-full h-3/4 ">
                <AnimatePresence className="relative w-full h-full">

                    <MotionDiv className="absolute top-0 w-full h-full fade-image"
                        style={{ backgroundImage: `url(${rushImages[imgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75 }}
                        key={imgIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.75 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >

                    </MotionDiv>
                </AnimatePresence>
            </div>
            <div className="main-content relative">
                <Title text="Upcoming Rush Events" className="pl-15 pt-20" />
                <div className="rush-events mt-10 p-5">
                    {displayRushEvents(upcomingRushEvents)}
                </div>
            </div>
        </div>
    )
}