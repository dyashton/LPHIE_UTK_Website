import Title from "../components/Title"
import JavonImg from "../assets/Javon.jpg"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const executiveBoard = [
    {
        name: "Javon Garcia",
        lineName: "Endless",
        position: "President",
        imgSrc: JavonImg,
        year: "Junior",
        major: "Computer Engineering",
        big: "Rocco Philom",
        little: ["James Kargauer"],
        hobbies: ["BTD6", "Coding", "Cooking"],
    },
    {
        name: "Javon Garcia",
        lineName: "Endless",
        position: "President",
        imgSrc: JavonImg,
        year: "Junior",
        major: "Computer Engineering",
        big: "Rocco Philom",
        little: ["James Kargauer"],
        hobbies: ["BTD6", "Coding", "Cooking"],
    }
]




export default function Brothers() {

    function BrotherCard({ brother }) {
        const firstName = brother.name.split(" ")[0];
        const lastName = brother.name.split(" ")[1];
        const [isExtended, setIsExtended] = useState(false);
        return (
            <motion.div
                className={`brother-card w-[14rem] h-96 bg-primary border-accent border-2 rounded-md relative overflow-hidden cursor-pointer`}
                animate={{
                    width: isExtended ? "32rem" : "14rem", // Tailwind w-96 = 24rem, w-16 = 4rem
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                onClick={() => setIsExtended(!isExtended)}
            >
                <AnimatePresence initial={false}>
                    {!isExtended && (
                        <motion.div
                            key="front"
                            className="absolute rounded-xl flex flex-col items-center justify-space-between p-4 w-[14rem] h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <p className="brother-position text-center text-xl font-semibold">{brother.position}</p>
                            <img src={brother.imgSrc} alt={brother.name} className="brother-image aspect-square w-3/4 rounded-full object-cover" />
                            <h2 className="brother-name flex flex-row gap-[1ch]">{firstName} <p className="text-accent">"{brother.lineName}"</p> {lastName} </h2>
                            <p className="brother-details text-center">{brother.major}</p>
                            <p className="brother-details text-center">{brother.year}</p>
                        </motion.div>
                    )}

                    {isExtended && (
                        <motion.div
                            key="back"
                            className="absolute rounded-xl flex items-center justify-center w-[32rem] h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <p className="brother-big">Big: {brother.big}</p>
                            <p className="brother-littles">Littles: {brother.little.join(", ")}</p>
                            <p className="brother-hobbies">Hobbies: {brother.hobbies.join(", ")}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    return (
        <div className="w-full h-full pt-40 pl-15">
            <div className="w-full h-1/2 m-10">
                <Title text="Executive Board" />
                <div className="e-board p-10 w-full h-full flex flex-wrap justify-start items-center gap-10">
                    {executiveBoard.map((brother) => (
                        <BrotherCard key={brother.name} brother={brother} />
                    ))}
                </div>
            </div>
            <div>
                <Title text="Active Brothers" />
                <div></div>
            </div>
        </div>
    )
}