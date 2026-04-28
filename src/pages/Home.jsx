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
        <div className="w-full h-full relative ">
            <div className="absolute top-0 right-0 w-[35em] h-full z-2 pt-25 pb-10 px-10">
                <div className="bg-[rgba(33,33,33,0.7)] w-full h-full px-5 pt-10">
                    <h1 className="text-text-primary text-4xl font-cinzel w-full mb-5 font-medium">Recent Events</h1>
                    <ul className="gap-5 flex flex-col">
                        {recent_events.slice().reverse().map((event, index) => (
                            <li key={index}>
                                <h2 className="font-bold text-accent text-xl">{event.title}</h2>
                                <h3 className="text-text-secondary"> - {event.date} - </h3>
                                <p>{event.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <AnimatePresence>

                <MotionDiv
                    key={imgIndex}
                    className="absolute w-full h-full "
                    style={{ backgroundImage: `url(${homeImages[imgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                />
            </AnimatePresence>
            <div className="relative pt-40 pl-15 z-1 flex flex-col gap-2">
                <MotionH1
                    className="text-text-primary text-8xl font-cinzel"
                    animate={{
                        color: ["#4169E1", "#F2F3F4", "#4169E1"]
                    }}
                    transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                >Lambda Phi Epsilon</MotionH1>
                <h1 className="text-text-secondary text-4xl">University of Tennessee, Knoxville</h1>
            </div>
        </div>
    )
}