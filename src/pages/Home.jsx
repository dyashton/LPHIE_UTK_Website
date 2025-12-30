import bgimg from "../assets/bgimg.jpeg"
import bgimg2 from "../assets/bgimg2.jpeg"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const images = [bgimg, bgimg2];

export default function Home() {
    const [imgIndex, setImgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setImgIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 10 seconds

        return () => clearInterval(interval);
    }, []);
    return (
        <div className="w-full h-full relative">
            <AnimatePresence>

                <motion.div
                    key={imgIndex}
                    className="absolute w-full h-full "
                    style={{ backgroundImage: `url(${images[imgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                />
            </AnimatePresence>
            <div className="relative pt-40 pl-15 z-1 flex flex-col gap-2">
                <motion.h1
                    className="text-text-primary text-8xl font-cinzel"
                    animate={{
                        color: ["#4169E1", "#F2F3F4", "#4169E1"]
                    }}
                    transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
                >Lambda Phi Epsilon</motion.h1>
                <h1 className="text-text-secondary text-4xl">University of Tennessee, Knoxville</h1>
            </div>
        </div>
    )
}