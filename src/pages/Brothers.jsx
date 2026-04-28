import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useContext } from "react"
import { BrothersContext } from "../providers/BrothersContext"

const MotionDiv = motion.div;
const MotionImg = motion.img;





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
    const imgSrc = images?.[brother.lineName] || null;
    // const [isExtended, setIsExtended] = useState(false);


    // useEffect(() => {
    //     console.log("isExtended for", brother.lineName, "is now", isExtended);
    // }, [isExtended]);


    return (
        <MotionDiv
            className={`brother-card w-[18rem] h-108 bg-primary border-accent border-2 rounded-md relative overflow-hidden cursor-pointer`}
            animate={{
                width: extendedBrother === brother.lineName ? "48rem" : "18rem", // Tailwind w-96 = 24rem, w-16 = 4rem
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={() => { setExtendedBrother(extendedBrother === brother.lineName ? null : brother.lineName); }}
            whileHover={{ borderColor: "#F2F3F4" }}
            id={brother.lineName}
        >
            <MotionDiv
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
                {imgSrc ? (
                    <MotionImg
                        src={imgSrc}
                        alt={brother.getFullName()}
                        className="brother-image absolute top-0 right-0 w-[18rem] h-full object-cover"
                        variants={fadeMask}
                        initial="hidden"
                        animate={extendedBrother === brother.lineName ? "visible" : "hidden"}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                ) : (
                    <div className="absolute top-0 right-0 w-[18rem] h-full bg-linear-to-b from-secondary/40 via-primary to-primary flex items-center justify-center">
                        <div className="text-5xl font-cinzel text-text-primary/70 select-none">
                            {(firstName?.[0] || "").toUpperCase()}{(lastName?.[0] || "").toUpperCase()}
                        </div>
                    </div>
                )}
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
            </MotionDiv>

            <AnimatePresence initial={false}>
                {extendedBrother === brother.lineName && (
                    <MotionDiv
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
                    </MotionDiv>
                )}
            </AnimatePresence>
        </MotionDiv>
    )
}

export default function Brothers() {
    const { brothers } = useContext(BrothersContext);
    const { images } = useContext(BrothersContext);
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
        setExtendedBrother(brother.lineName);
        const element = document.getElementById(brother.lineName);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };


    return (
        <PageContainer className="pb-20" maxWidthClassName="max-w-7xl">
            <Title as="h1" text="Brothers" />

            <div className="w-full h-fit mt-10">
                <Title as="h2" text="Executive Board" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Active Brothers" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Alumni Brothers" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Charter Command Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Alpha Avatar Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Beta Bankai Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Gamma Ga Kill Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Delta Doraemon Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Epsilon Evangelion Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Zeta Z-Fighter Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Eta Edgerunner Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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
            <div className="w-full h-fit mt-12">
                <Title as="h2" text="Theta Titan Class" />
                <div className="e-board w-full h-full flex flex-wrap justify-start items-center gap-8 pt-8">
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


        </PageContainer>
    )
}