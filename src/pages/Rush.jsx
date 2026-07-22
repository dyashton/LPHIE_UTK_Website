import Title from "../components/Title"
import { useState, useContext, useEffect } from "react"
import { BrothersContext } from "../providers/BrothersContext"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Papa from "papaparse";
import { Link } from "react-router-dom"
import PageContainer from "../components/PageContainer"
import InstagramStrip from "../components/InstagramStrip"
import Reveal from "../components/Reveal"

const MotionDiv = motion.div;

function displayRushEvents(events) {
    return events.map((event, index) => (
        <div key={index} className="rush-event mb-8 relative">
            <h3 className="text-lg sm:text-2xl font-bold">{event.date} - {event.title}</h3>
            <p className="mt-2 text-base sm:text-lg">{event.description}</p>
        </div>
    ));
}

function OffSeasonStory() {
    return (
        <div className="space-y-6">
            <p className="text-lg sm:text-2xl font-cinzel text-text-primary">
                Rush has ended for this semester.
            </p>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl">
                Between cycles, stay close to the brotherhood — meet our brothers, explore chapter history, and follow along for the next rush.
            </p>
            <ul className="space-y-3 text-lg">
                <li>
                    <Link to="/brothers" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                        Meet the Brothers
                    </Link>
                </li>
                <li>
                    <Link to="/about" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                        About Beta Kappa
                    </Link>
                </li>
                <li>
                    <Link to="/gallery" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                        Gallery
                    </Link>
                </li>
                <li>
                    <a href="#interest-form" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                        Interest form
                    </a>
                </li>
            </ul>
            <p className="text-text-secondary">
                Questions? Reach us on Instagram{" "}
                <a
                    href="https://www.instagram.com/utklphie/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-4"
                >
                    @lphie_utk
                </a>
                .
            </p>
        </div>
    );
}

export default function Rush() {
    const [imgIndex, setImgIndex] = useState(0);
    const [upcomingRushEvents, setUpcomingRushEvents] = useState([]);
    const [status, setStatus] = useState("loading");
    const { rushImages, galleryImages } = useContext(BrothersContext);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/datasets/rush");
                if (!res.ok) throw new Error("rush");
                const payload = await res.json();
                const results = Papa.parse(payload.csvText, { header: true, skipEmptyLines: true });
                const events = results.data.map((item) => ({
                    date: item.date,
                    title: item.title,
                    description: item.description,
                }));
                if (!cancelled) {
                    setUpcomingRushEvents(events);
                    setStatus("ok");
                }
            } catch {
                if (!cancelled) setStatus("error");
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (reducedMotion) return;
        if (!Array.isArray(rushImages) || rushImages.length <= 1) return;
        const interval = setInterval(() => {
            setImgIndex((prevIndex) => (prevIndex + 1) % rushImages.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [rushImages, reducedMotion]);

    const heroImageUrl = Array.isArray(rushImages) && rushImages.length ? rushImages[imgIndex % rushImages.length] : null;
    const offSeason = status === "ok" && upcomingRushEvents.length === 0;
    const cultureStrip = (galleryImages || []).slice(0, 4);

    return (
        <div className="w-full min-h-dvh relative bg-background">
            <div className="relative w-full h-[min(72vh,820px)] sm:h-[min(78vh,900px)] min-h-[22rem] overflow-hidden">
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
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/40 via-transparent to-background" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-48 bg-linear-to-t from-background via-background/80 to-transparent" />

                <PageContainer className="relative z-20">
                    <Title as="h1" text="Rush" />
                </PageContainer>
            </div>

            <PageContainer className="relative z-30 -mt-14 sm:-mt-20 md:-mt-24 pb-16">
                <Title as="h2" className="!text-2xl sm:!text-4xl lg:!text-5xl" text={offSeason ? "Between Rush Cycles" : "Upcoming Rush Events"} />
                <div className="rush-events mt-5 sm:mt-7">
                    {status === "loading" && <p className="text-text-secondary">Loading rush events…</p>}
                    {status === "error" && <p className="text-text-secondary">Couldn’t load rush events.</p>}
                    {status === "ok" && offSeason && <OffSeasonStory />}
                    {status === "ok" && !offSeason && displayRushEvents(upcomingRushEvents)}
                </div>

                {offSeason && cultureStrip.length > 0 && (
                    <Reveal className="mt-12">
                        <h3 className="font-cinzel text-2xl text-accent mb-4">Chapter culture</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {cultureStrip.map((url) => (
                                <div key={url} className="aspect-square overflow-hidden bg-primary">
                                    <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                                </div>
                            ))}
                        </div>
                        <Link to="/gallery" className="mt-4 inline-block text-accent underline underline-offset-4">
                            Full gallery →
                        </Link>
                    </Reveal>
                )}

                <div id="interest-form">
                    <Reveal className="mt-12">
                        <Title as="h2" className="!text-2xl sm:!text-4xl lg:!text-5xl mb-4" text="Interest Form" />
                        <p className="text-base sm:text-lg text-text-secondary max-w-2xl">
                            Interested in learning more? Fill out this form and stay updated on our upcoming events and recruitment activities.
                        </p>
                        <div className="w-full mt-6 border border-tertiary/40 bg-primary/60">
                            <iframe
                                title="UTK Lambda Phi Epsilon Interest Form"
                                src="https://docs.google.com/forms/d/e/1FAIpQLSdZYdswAKEQ92Bd6MVgTaOpZeQZBjp_JHBERZ8n-EhL0jQD5A/viewform?embedded=true"
                                className="w-full h-[900px] sm:h-[1000px]"
                            >
                                Loading…
                            </iframe>
                        </div>
                        <p className="mt-4 text-text-secondary">
                            Prefer to open it separately?{" "}
                            <a
                                href="https://docs.google.com/forms/d/e/1FAIpQLSdZYdswAKEQ92Bd6MVgTaOpZeQZBjp_JHBERZ8n-EhL0jQD5A/viewform?pli=1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                            >
                                Open the interest form
                            </a>
                            .
                        </p>
                    </Reveal>
                </div>

                <Reveal className="mt-12">
                    <InstagramStrip />
                </Reveal>
            </PageContainer>
        </div>
    )
}
