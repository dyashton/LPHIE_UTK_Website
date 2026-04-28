import Title from "../components/Title"
import { useState, useContext, useEffect } from "react"
import { BrothersContext } from "../providers/BrothersContext"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Papa from "papaparse";
import PageContainer from "../components/PageContainer"

const MotionDiv = motion.div;

function displayRushEvents(events) {
    if (!events || events.length === 0) {
        return <p className="text-lg sm:text-2xl font-cinzel">Rush has ended for this semester. Please check back later or contact us <a href="https://www.instagram.com/utklphie/" target="blank" className="text-accent cursor-pointer">@utklphie</a></p>;
    }
    return events.map((event, index) => (
        <div key={index} className="rush-event mb-8 relative">
            <h3 className="text-lg sm:text-2xl font-bold">{event.date} - {event.title}</h3>
            <p className="mt-2 text-base sm:text-lg">{event.description}</p>
        </div>
    ));
}

export default function Rush() {
    const [imgIndex, setImgIndex] = useState(0);
    const [upcomingRushEvents, setUpcomingRushEvents] = useState([]);
    const { rushImages } = useContext(BrothersContext);
    const reducedMotion = useReducedMotion();

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
        if (reducedMotion) return;
        if (!Array.isArray(rushImages) || rushImages.length <= 1) return;
        const interval = setInterval(() => {
            setImgIndex((prevIndex) => (prevIndex + 1) % rushImages.length);
        }, 5000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [rushImages, reducedMotion]);

    const heroImageUrl = Array.isArray(rushImages) && rushImages.length ? rushImages[imgIndex % rushImages.length] : null;
    return (
        <div className="w-full min-h-dvh relative">
            <div className="relative w-full h-[42vh] sm:h-[52vh] lg:h-[58vh]">
                <PageContainer paddedTop={false} className="absolute inset-x-0 top-24 sm:top-32 z-20">
                    <Title as="h1" text="Rush" />
                </PageContainer>
                <div className="absolute inset-0 bg-linear-to-b from-primary via-background to-background fade-image" />
                {heroImageUrl && !reducedMotion ? (
                    <AnimatePresence className="relative w-full h-full">
                        <MotionDiv
                            className="absolute top-0 w-full h-full fade-image"
                            style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.75 }}
                            key={imgIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.75 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        />
                    </AnimatePresence>
                ) : heroImageUrl ? (
                    <div
                        className="absolute top-0 w-full h-full fade-image opacity-75"
                        style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                ) : null}
            </div>
            <div className="main-content relative -mt-10 sm:-mt-14 z-10">
                <PageContainer className="pb-16">
                    <div className="pt-2 sm:pt-4">
                        <Title as="h2" text="Upcoming Rush Events" />
                    </div>
                    <div className="rush-events mt-4 sm:mt-6">
                        {displayRushEvents(upcomingRushEvents)}
                    </div>
                </PageContainer>
            </div>
        </div>
    )
}