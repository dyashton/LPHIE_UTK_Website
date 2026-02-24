import Title from "../components/Title"
import JavonImg from "../assets/portraits/Endless.png"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useContext, useRef, forwardRef, useImperativeHandle, useEffect } from "react"
import { BrothersContext } from "../providers/BrothersProvider"





function renderBigOrLittle(brothers, jumpToBrother) {
    return <ul className="pl-8">
        {brothers.map((brother) => {
            return <li key={brother.getFullName()} onClick={(e) => {
                e.stopPropagation();
                jumpToBrother(brother)
            }}
                className="flex flex-row gap-[1ch] font-normal">
                <p>{brother.firstName}</p>
                <p className="text-accent text-nowrap font-cinzel">"{brother.lineName}"</p>
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

function BrotherCard({ brother, images, jumpToBrother, extendedBrother, setExtendedBrother }) {
    const firstName = brother.firstName
    const lastName = brother.lastName;
    // const [isExtended, setIsExtended] = useState(false);


    // useEffect(() => {
    //     console.log("isExtended for", brother.lineName, "is now", isExtended);
    // }, [isExtended]);


    return (
        <motion.div
            className={`brother-card w-[18rem] h-108 bg-primary border-accent border-2 rounded-md relative overflow-hidden cursor-pointer`}
            animate={{
                width: extendedBrother === brother.lineName ? "48rem" : "18rem", // Tailwind w-96 = 24rem, w-16 = 4rem
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => { setExtendedBrother(extendedBrother === brother.lineName ? null : brother.lineName); }}
            whileHover={{ borderColor: "#F2F3F4" }}
            id={brother.lineName}
        >
            <motion.div
                key="front"
                className="rounded-xl w-[18rem] h-full absolute top-0 right-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}

            >
                <div className="absolute w-full h-15 top-0 left-0 bg-linear-to-b from-[rgba(33,33,33,1.5)] to-[rgba(0,0,0,0)] z-5">
                    <div className="absolute top-3 right-3 text-3xl text-text-primary outlined-text font-cinzel font-bold select-none pointer-events-none z-5">
                        {brother.lineNumber}
                    </div>
                    <div className="absolute top-3 left-3 w-3/4 text-xl text-text-primary  font-cinzel font-bold select-none pointer-events-none z-5">
                        {brother.position}

                    </div>
                </div>
                <motion.img src={images[brother.lineName]} alt={brother.getFullName()} className="brother-image absolute top-0 right-0 w-[18rem] h-full object-cover"
                    loading="lazy"
                    variants={fadeMask}
                    initial="hidden"
                    animate={extendedBrother === brother.lineName ? "visible" : "hidden"}
                    transition={{ duration: 0.6, ease: "easeOut" }} />
                <div className="relative z-10 h-full flex flex-col items-center justify-end px-4 bg-linear-to-b from-[rgba(0,0,0,0)] to-[rgba(33,33,33,1.5)] text-text-primary pb-6">
                    <div className="brother-position text-xl font-medium w-full">{firstName}{" "}
                        <span className="text-accent font-cinzel">"{brother.lineName}"</span>{" "}
                        {lastName}</div>
                    {/* <h2 className="brother-name flex flex-row gap-[1ch] w-full h-fit text-wrap">{firstName} <p className="text-accent text-nowrap">"{brother.lineName}"</p> {lastName} </h2> */}
                    <p className="brother-details w-full">{brother.major}</p>
                    <h2 className="brother-name w-full">
                        {brother.family} Family
                    </h2>
                    <p className="brother-details w-full">{brother.classYear}</p>
                </div>
            </motion.div>

            <AnimatePresence initial={false}>
                {extendedBrother === brother.lineName && (
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
                            {renderBigOrLittle(brother.bigs, jumpToBrother)}</div>
                        <div className="brother-littles w-full"><p>Little{brother.littles.length !== 1 ? "s" : ""}: </p>{renderBigOrLittle(brother.littles, jumpToBrother)}</div>
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

export default function Brothers() {
    const { brothers, setBrothers } = useContext(BrothersContext);
    const { images, setImages } = useContext(BrothersContext);
    const [extendedBrother, setExtendedBrother] = useState(null);

    const executiveBoard = brothers.filter(brother => (brother.position !== "Alumni" && brother.position !== "Active"));
    const activeBrothers = brothers.filter(brother => brother.position === "Active");
    const alumniBrothers = brothers.filter(brother => brother.position === "Alumni");
    const charterClass = brothers.filter(brother => brother.crossingClass === "Charter");
    const alphaClass = brothers.filter(brother => brother.crossingClass === "Alpha");
    const betaClass = brothers.filter(brother => brother.crossingClass === "Beta");
    const gammaClass = brothers.filter(brother => brother.crossingClass === "Gamma");
    const deltaClass = brothers.filter(brother => brother.crossingClass === "Delta");
    const epsilonClass = brothers.filter(brother => brother.crossingClass === "Epsilon");
    const zetaClass = brothers.filter(brother => brother.crossingClass === "Zeta");
    const etaClass = brothers.filter(brother => brother.crossingClass === "Eta");
    const thetaClass = brothers.filter(brother => brother.crossingClass === "Theta");


    const jumpToBrother = (brother) => {
        console.log("Attempting to jump to:", brother.lineName);
        setExtendedBrother(brother.lineName);
        const element = document.getElementById(brother.lineName);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };


    return (
        <div className="w-full h-full pt-40 pl-15">
            <Title text="Brothers" />
            <div className="w-full h-fit p-10">
                <Title text="Executive Board" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {executiveBoard.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Active Brothers" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {activeBrothers.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Alumni Brothers" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {alumniBrothers.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Charter Command Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {charterClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Alpha Avatar Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {alphaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Beta Bankai Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {betaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Gamma Ga Kill Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {gammaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Delta Doraemon Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {deltaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Epsilon Evangelion Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {epsilonClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Zeta Z-Fighter Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {zetaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Eta Edgerunner Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {etaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>
            <div className="w-full h-fit p-10">
                <Title text="Theta Titan Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-10 pt-10">
                    {thetaClass.map((brother) => (
                        <BrotherCard
                            key={brother.getFullName()}
                            brother={brother}
                            images={images}
                            jumpToBrother={jumpToBrother}
                            extendedBrother={extendedBrother}
                            setExtendedBrother={setExtendedBrother}
                        />
                    ))}
                </div>
            </div>


        </div>
    )
}