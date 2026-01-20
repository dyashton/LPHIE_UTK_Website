import Title from "../components/Title"
import JavonImg from "../assets/Javon.png"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Brother from "../model/Brother"
import brotherData from "../data/brotherdata.json"
import React from "react"

function loadBrothers() {
    const images = import.meta.glob("../assets/*", { eager: true });
    const brothersDict = {};
    const brothers = brotherData.brothers.map(brother => {
        const imageUrl = images[`../assets/${brother.imageUrl}`]?.default || brother.imageUrl;
        const newBrother = new Brother(
            brother.firstName,
            brother.lineName,
            brother.lastName,
            brother.position,
            brother.classYear,
            brother.graduationYear,
            brother.major,
            brother.hometown,
            brother.funFact,
            imageUrl,
            brother.hobbies,
            brother.bigsNames,
            brother.littlesNames,
            brother.crossingClass
        );
        brothersDict[newBrother.lineName] = newBrother;
        return newBrother;
    });
    // Set bigs and littles
    brothers.forEach(brother => {
        const bigBrothers = brother.bigsNames.map(name => brothersDict[name]).filter(b => b);
        const littleBrothers = brother.littlesNames.map(name => brothersDict[name]).filter(b => b);
        brother.setBig(bigBrothers);
        brother.setLittle(littleBrothers);
    });

    return { brothers, brothersDict };
}

const { brothers: executiveBoard, brothersDict: executiveBoardDict } = loadBrothers()

function renderBigOrLittle(brothers) {
    return <ul className="pl-8">
        {brothers.map((brother) => {
            return <li key={brother.getFullName()}
                className="flex flex-row gap-[1ch] font-normal">
                <p>{brother.firstName}</p>
                <p className="text-accent text-nowrap">"{brother.lineName}"</p>
                <p>{brother.lastName}</p>
            </li>
        })}
    </ul>
}

function renderHobbies(hobbies) {
    return <div className="font-normal pl-8">
        {hobbies.join(", ")}
    </div>
}


const fadeMask = {
    hidden: {
        WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 0%)",
        maskImage:
            "linear-gradient(to right, transparent 0%, black 0%)",
    },
    visible: {
        WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 25%)",
        maskImage:
            "linear-gradient(to right, transparent 0%, black 25%)",
    },
};


export default function Brothers() {

    function BrotherCard({ brother }) {
        const firstName = brother.firstName
        const lastName = brother.lastName;
        if (firstName === "Javon") {

        }
        const [isExtended, setIsExtended] = useState(false);
        return (
            <motion.div
                className={`brother-card w-[18rem] h-108 bg-primary border-accent border-2 rounded-md relative overflow-hidden cursor-pointer relative`}
                animate={{
                    width: isExtended ? "48rem" : "18rem", // Tailwind w-96 = 24rem, w-16 = 4rem
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                onClick={() => setIsExtended(!isExtended)}
                whileHover={{ borderColor: "#F2F3F4" }}
            >
                <motion.div
                    key="front"
                    className="rounded-xl w-[18rem] h-full absolute top-0 right-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}

                >
                    <motion.img src={brother.imageUrl} alt={brother.getFullName()} className="brother-image absolute top-0 right-0 w-[18rem] h-full object-cover"
                        variants={fadeMask}
                        initial="hidden"
                        animate={isExtended ? "visible" : "hidden"}
                        transition={{ duration: 0.6, ease: "easeOut" }} />
                    <div className="relative z-10 h-full flex flex-col items-center justify-end px-4 bg-linear-to-b from-[rgba(0,0,0,0)] to-[rgba(33,33,33,1.5)] text-text-primary pb-6">
                        <p className="brother-position text-xl font-semibold w-full">{brother.position}</p>
                        {/* <h2 className="brother-name flex flex-row gap-[1ch] w-full h-fit text-wrap">{firstName} <p className="text-accent text-nowrap">"{brother.lineName}"</p> {lastName} </h2> */}
                        <h2 className="brother-name w-full text-wrap leading-tight">
                            {firstName}{" "}
                            <span className="text-accent">"{brother.lineName}"</span>{" "}
                            {lastName}
                        </h2>
                        <p className="brother-details w-full">{brother.major}</p>
                        <p className="brother-details w-full">{brother.classYear}</p>
                    </div>
                </motion.div>

                <AnimatePresence initial={false}>
                    {isExtended && (
                        <motion.div
                            key="back"
                            className="absolute rounded-xl text-lg font-medium flex flex-col items-center justify-start w-[30rem] h-full p-5 gap-5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >

                            <div className="brother-big w-full">
                                <p>Big{brother.bigs.length !== 1 ? "s" : ""}:</p>
                                {renderBigOrLittle(brother.bigs)}</div>
                            <div className="brother-littles w-full"><p>Little{brother.littles.length !== 1 ? "s" : ""}: </p>{renderBigOrLittle(brother.littles)}</div>
                            <div className="crossing-class w-full">
                                <p>Crossing Class: </p>
                                <div className="font-cinzel text-accent text-xl pl-8">
                                    {brother.getCrossingClass()}
                                </div>
                            </div>
                            <div className="brother-hometown w-full">
                                <p>Hometown: </p>
                                <div className="font-normal pl-8">
                                    {brother.hometown}
                                </div>
                            </div>
                            <div className="brother-hobbies w-full"><p>Hobbies:</p>{renderHobbies(brother.hobbies)}</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    return (
        <div className="w-full h-full pt-40 pl-15">
            <Title text="Brothers" />
            <div className="w-full h-fit p-10">
                <Title text="Executive Board" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {executiveBoard.map((brother) => (
                        <BrotherCard key={brother.getFullName()} brother={brother} />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Active Brothers" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {executiveBoard.map((brother) => (
                        <BrotherCard key={brother.getFullName()} brother={brother} />
                    ))}
                </div>
            </div>
        </div>
    )
}