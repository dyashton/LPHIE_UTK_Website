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
        <div className="w-full min-h-dvh relative bg-background">
            {/* Hero: tall enough for imagery; bottom scrim blends into overlapping panel */}
            <div className="relative w-full h-[min(72vh,820px)] sm:h-[min(78vh,900px)] min-h-[22rem] overflow-hidden">
                {/* Base wash when no photo or under photo */}
                <div className="absolute inset-0 bg-linear-to-b from-primary via-background to-background" />
                {heroImageUrl && !reducedMotion ? (
                    <AnimatePresence mode="wait">
                        <MotionDiv
                            className="absolute inset-0 fade-image"
                            style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
                            key={imgIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        />
                    </AnimatePresence>
                ) : heroImageUrl ? (
                    <div
                        className="absolute inset-0 fade-image"
                        style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center top' }}
                    />
                ) : null}
                {/* Readability + blend into page */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/40 via-transparent to-background" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-48 bg-linear-to-t from-background via-background/80 to-transparent" />

                <PageContainer paddedTop={false} className="relative z-20 pt-24 sm:pt-32">
                    <Title as="h1" text="Rush" />
                </PageContainer>
            </div>

            {/* Overlaps hero: card sits on top of the background */}
            <PageContainer className="relative z-30 -mt-14 sm:-mt-20 md:-mt-24 pb-16">
                <div className="rounded-2xl border-2 border-accent/50 bg-primary/90 backdrop-blur-md shadow-[0_-8px_40px_rgba(0,0,0,0.35)] px-5 py-6 sm:px-8 sm:py-8">
                    <Title as="h2" className="!text-2xl sm:!text-4xl lg:!text-5xl" text="Upcoming Rush Events" />
                    <div className="rush-events mt-5 sm:mt-7">
                        {displayRushEvents(upcomingRushEvents)}
                    </div>
                </div>
            </PageContainer>
        </div>
    )
}