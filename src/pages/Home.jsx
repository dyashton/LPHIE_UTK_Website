// import bgimg from "../assets/bgimg.jpeg"
// import bgimg2 from "../assets/bgimg2.jpeg"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useContext } from "react"
import { BrothersContext } from "../providers/BrothersContext"

const MotionDiv = motion.div;
const MotionH1 = motion.h1;

// const images = [bgimg, bgimg2];

const recent_events = [
    {
        title: "Theta Line Crossed",
        date: "November 9, 2025",
        description: "Congratulations to the Theta line for successfully crossing into Lambda Phi Epsilon! We are proud to welcome our newest brothers who have shown dedication and commitment to our fraternity's values."
    },
    {
        title: "Spring 2026 Rush",
        date: "March 7  , 2026",
        description: "Join us for our Spring 2026 Rush events! Meet our brothers, learn about our values, and discover what it means to be part of Lambda Phi Epsilon at UTK."
    },

]

export default function Home() {
    const [imgIndex, setImgIndex] = useState(0);
    const { homeImages } = useContext(BrothersContext);

    useEffect(() => {
        const interval = setInterval(() => {
            setImgIndex((prevIndex) => (prevIndex + 1) % homeImages.length);
        }, 5000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, [homeImages]);
    return (
        <div className="w-full min-h-dvh relative pb-16">
            <AnimatePresence>

                <MotionDiv
                    key={imgIndex}
                    className="absolute inset-0 w-full h-full"
                    style={{ backgroundImage: `url(${homeImages[imgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                />
            </AnimatePresence>
            <div className="relative z-10 min-h-dvh pt-24 sm:pt-32 lg:pt-40 px-4 sm:px-8 lg:pl-15 flex flex-col gap-6 md:gap-0">
                <div className="max-w-4xl">
                    <MotionH1
                        className="text-text-primary text-4xl sm:text-6xl lg:text-8xl font-cinzel leading-tight"
                        animate={{
                            color: ["#4169E1", "#F2F3F4", "#4169E1"]
                        }}
                        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                    >
                        Lambda Phi Epsilon
                    </MotionH1>
                    <h1 className="text-text-secondary text-xl sm:text-2xl lg:text-4xl mt-2">
                        University of Tennessee, Knoxville
                    </h1>
                </div>

                <div className="w-full max-w-2xl md:max-w-md md:absolute md:top-28 lg:top-36 md:right-8 lg:right-10 bg-[rgba(33,33,33,0.7)] px-5 py-6 rounded-md md:max-h-[60vh] md:overflow-auto">
                    <h2 className="text-text-primary text-2xl sm:text-3xl font-cinzel w-full mb-4 font-medium">
                        Recent Events
                    </h2>
                    <ul className="gap-5 flex flex-col">
                        {recent_events.slice().reverse().map((event, index) => (
                            <li key={index}>
                                <h3 className="font-bold text-accent text-lg sm:text-xl">{event.title}</h3>
                                <div className="text-text-secondary text-sm sm:text-base">- {event.date} -</div>
                                <p className="text-sm sm:text-base">{event.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}