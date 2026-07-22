import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useContext, useRef, useEffect, useMemo } from "react"
import { BrothersContext } from "../providers/BrothersContext"

const MotionDiv = motion.div;
const MotionImg = motion.img;

const CARD_WIDTH_REM = 14;
const DETAILS_WIDTH_REM = 24;
const EXPANDED_WIDTH_REM = CARD_WIDTH_REM + DETAILS_WIDTH_REM;
const DETAILS_WIDTH_PX = DETAILS_WIDTH_REM * 16;

// ponytail: easter egg keyed to CSV lineName — bump if Ashton ever renames
const DEVELOPER_LINE_NAME = "AvaLoN";

function MatrixRain() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let raf = 0;
        const fontSize = 14;
        const glyphs = "0123456789ABCDEF<>/$#@*&%+=アイウエオカキクケコΑΒΓΔΣΩ";
        let columns = 0;
        let drops = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.ceil(canvas.width / fontSize);
            drops = Array.from({ length: columns }, () => Math.random() * -40);
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            for (let i = 0; i < columns; i++) {
                const ch = glyphs[(Math.random() * glyphs.length) | 0];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillStyle = i % 7 === 0 ? "#F2F3F4" : "#4169E1";
                ctx.fillText(ch, x, y);
                if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                else drops[i]++;
            }
            raf = requestAnimationFrame(draw);
        };
        raf = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

function DeveloperEgg({ brother, imgSrc, onClose, jumpToBrother }) {
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose]);

    const goTo = (b) => {
        onClose();
        jumpToBrother?.(b);
    };

    const field = (label, children) => (
        <div className="w-full text-left">
            <p className="font-mono text-xs text-accent/80">{label}</p>
            <div className="mt-0.5 pl-3 text-sm text-text-primary">{children}</div>
        </div>
    );

    return (
        <MotionDiv
            className="fixed inset-0 z-100 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Developer easter egg"
        >
            <div className="absolute inset-0 bg-black" />
            <MatrixRain />
            <MotionDiv
                className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col items-center gap-4 overflow-y-auto rounded-md border border-accent/50 bg-black/70 px-5 py-6 text-center backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.85, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
            >
                <p className="font-mono text-xs tracking-[0.35em] text-accent uppercase">
                    root@lphie-utk:~$ whoami
                </p>
                {imgSrc ? (
                    <img
                        src={imgSrc}
                        alt={brother.getFullName()}
                        className="h-44 w-44 rounded-md border-2 border-accent object-cover shadow-[0_0_40px_rgba(65,105,225,0.35)]"
                    />
                ) : null}
                <div>
                    <p className="font-mono text-xs text-text-secondary">
                        #{brother.lineNumber}
                        {brother.position ? ` · ${brother.position}` : ""}
                    </p>
                    <h2 className="mt-1 font-cinzel text-2xl sm:text-3xl text-text-primary">
                        {brother.firstName}{" "}
                        <span className="text-accent">"{brother.lineName}"</span>{" "}
                        {brother.lastName}
                    </h2>
                </div>
                <MotionDiv
                    className="font-mono text-lg text-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1] }}
                    transition={{ delay: 0.7, duration: 1.2 }}
                >
                    &gt; SITE_DEVELOPER
                </MotionDiv>
                <p className="max-w-sm font-mono text-sm leading-relaxed text-text-secondary">
                    I built this website. Every pixel, every scroll, every brother card —
                    including this one.
                </p>

                <div className="mt-2 flex w-full flex-col gap-3 border-t border-accent/30 pt-4">
                    {field("Major", <>{brother.major}{brother.minor ? ` · Minor: ${brother.minor}` : ""}</>)}
                    {field("Class / Grad", <>{brother.classYear} · Class of {brother.graduationYear}</>)}
                    {field("Family", <>{brother.family} Family</>)}
                    {field("Crossing Class", <span className="font-cinzel text-accent">{brother.getCrossingClass()}</span>)}
                    {field("Hometown", brother.hometown)}
                    {field(
                        brother.bigs.length !== 1 ? "Bigs" : "Big",
                        brother.bigs.length ? (
                            <ul className="space-y-0.5">
                                {brother.bigs.map((b) => (
                                    <li key={b.getFullName()}>
                                        <button
                                            type="button"
                                            className="hover:text-accent"
                                            onClick={() => goTo(b)}
                                        >
                                            {b.firstName} <span className="font-cinzel text-accent">"{b.lineName}"</span> {b.lastName}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-text-secondary">—</span>
                        ),
                    )}
                    {field(
                        brother.littles.length !== 1 ? "Littles" : "Little",
                        brother.littles.length ? (
                            <ul className="space-y-0.5">
                                {brother.littles.map((b) => (
                                    <li key={b.getFullName()}>
                                        <button
                                            type="button"
                                            className="hover:text-accent"
                                            onClick={() => goTo(b)}
                                        >
                                            {b.firstName} <span className="font-cinzel text-accent">"{b.lineName}"</span> {b.lastName}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <span className="text-text-secondary">—</span>
                        ),
                    )}
                    {field("Hobbies", Array.isArray(brother.hobbies) ? brother.hobbies.join(", ") : brother.hobbies)}
                </div>

                <p className="font-mono text-xs text-text-secondary/70">
                    [ click anywhere / esc to exit ]
                </p>
            </MotionDiv>
        </MotionDiv>
    );
}





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


const fadeMaskLeft = {
    hidden: {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 0%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 0%)",
    },
    visible: {
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 25%)",
    },
};

const fadeMaskRight = {
    hidden: {
        WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 0%)",
        maskImage: "linear-gradient(to left, transparent 0%, black 0%)",
    },
    visible: {
        WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 25%)",
        maskImage: "linear-gradient(to left, transparent 0%, black 25%)",
    },
};

function BrotherCard({ brother, images, jumpToBrother, extendedBrother, setExtendedBrother, onDeveloperOpen }) {
    const firstName = brother.firstName
    const lastName = brother.lastName;
    const imgSrc = images?.[brother.lineName] || null;
    const isDeveloper = brother.lineName === DEVELOPER_LINE_NAME;
    const isExtended = extendedBrother === brother.lineName;
    const footprintRef = useRef(null);
    // Prefer expanding left (details on left); flip right when there isn't room.
    const [expandRight, setExpandRight] = useState(false);

    useEffect(() => {
        if (!isExtended) return;
        const t = setTimeout(() => {
            const rect = footprintRef.current?.getBoundingClientRect();
            if (!rect) return;
            setExpandRight(rect.left < DETAILS_WIDTH_PX + 16);
        }, 0);
        return () => clearTimeout(t);
    }, [isExtended]);

    const portraitSide = expandRight ? "left-0" : "right-0";
    const detailsSide = expandRight ? "right-0" : "left-0";
    const cardAnchor = expandRight ? "left-0" : "right-0";
    const fadeMask = expandRight ? fadeMaskRight : fadeMaskLeft;

    return (
        // Fixed layout footprint; visual card overlays neighbors when expanded.
        <div
            ref={footprintRef}
            id={brother.lineName}
            className="relative w-[14rem] h-80 shrink-0"
        >
            <MotionDiv
                className={`brother-card absolute top-0 ${cardAnchor} h-80 bg-primary border-accent border-2 rounded-md overflow-hidden cursor-pointer ${isExtended ? "z-30" : "z-10 hover:z-20"}`}
                initial={false}
                animate={{
                    width: isExtended ? `${EXPANDED_WIDTH_REM}rem` : `${CARD_WIDTH_REM}rem`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                onClick={() => {
                    if (isDeveloper) {
                        onDeveloperOpen?.(brother);
                        return;
                    }
                    if (isExtended) {
                        setExtendedBrother(null);
                        if (window.location.hash) {
                            window.history.replaceState(null, "", window.location.pathname + window.location.search);
                        }
                        return;
                    }
                    const rect = footprintRef.current?.getBoundingClientRect();
                    setExpandRight(rect ? rect.left < DETAILS_WIDTH_PX + 16 : false);
                    setExtendedBrother(brother.lineName);
                    window.history.replaceState(null, "", `#${encodeURIComponent(brother.lineName)}`);
                }}
                whileHover={{ borderColor: "#F2F3F4" }}
            >
                <MotionDiv
                    key="front"
                    className={`rounded-xl w-[14rem] h-full absolute top-0 ${portraitSide}`}
                >
                    <div className="absolute w-full h-12 top-0 left-0 bg-linear-to-b from-[rgba(33,33,33,1.5)] to-[rgba(0,0,0,0)] z-5">
                        <div className="absolute top-2 right-2 text-2xl text-text-primary outlined-text font-cinzel font-bold select-none pointer-events-none z-5">
                            {brother.lineNumber}
                        </div>
                        <div className="absolute top-2 left-2 w-3/4 text-base text-text-primary  font-cinzel font-bold select-none pointer-events-none z-5">
                            {brother.position}
                        </div>
                    </div>
                    {imgSrc ? (
                        <MotionImg
                            src={imgSrc}
                            alt={brother.getFullName()}
                            className={`brother-image absolute top-0 ${portraitSide} w-[14rem] h-full object-cover`}
                            variants={fadeMask}
                            initial={false}
                            animate={isExtended ? "visible" : "hidden"}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    ) : (
                        <div className={`absolute top-0 ${portraitSide} w-[14rem] h-full bg-linear-to-b from-secondary/40 via-primary to-primary flex items-center justify-center`}>
                            <div className="text-4xl font-cinzel text-text-primary/70 select-none">
                                {(firstName?.[0] || "").toUpperCase()}{(lastName?.[0] || "").toUpperCase()}
                            </div>
                        </div>
                    )}
                    <div className="relative z-10 h-full flex flex-col items-center justify-end px-3 bg-linear-to-b from-[rgba(0,0,0,0)] to-[rgba(33,33,33,1.5)] text-text-primary pb-4">
                        <div className="brother-position text-base font-medium w-full leading-snug">{firstName}{" "}
                            <span className="text-accent font-cinzel">"{brother.lineName}"</span>{" "}
                            {lastName}</div>
                        <p className="brother-details text-sm w-full">{brother.major}</p>
                        <h2 className="brother-name text-sm w-full">
                            {brother.family} Family
                        </h2>
                        <p className="brother-details text-sm w-full">{brother.classYear}</p>
                    </div>
                </MotionDiv>

                <AnimatePresence initial={false}>
                    {isExtended && (
                        <MotionDiv
                            key="back"
                            className={`absolute top-0 ${detailsSide} rounded-xl text-sm font-medium flex flex-col items-center justify-start w-[24rem] h-full pt-2 px-4 pb-4 gap-3 overflow-y-auto`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                            <div className="brother-big w-full">
                                <p>Big{brother.bigs.length !== 1 ? "s" : ""}:</p>
                                {renderBigOrLittle(brother.bigs, jumpToBrother)}
                            </div>
                            <div className="brother-littles w-full">
                                <p>Little{brother.littles.length !== 1 ? "s" : ""}: </p>
                                {renderBigOrLittle(brother.littles, jumpToBrother)}
                            </div>
                            <div className="crossing-class w-full">
                                <p>Crossing Class: </p>
                                <div className="font-cinzel text-accent text-lg pl-6">
                                    {brother.getCrossingClass()}
                                </div>
                            </div>
                            <div className="brother-hometown w-full">
                                <p>Hometown: </p>
                                <div className="font-normal pl-6">
                                    {brother.hometown}
                                </div>
                            </div>
                            <div className="brother-hobbies w-full">
                                <p>Hobbies:</p>
                                {renderHobbies(brother.hobbies)}
                            </div>
                        </MotionDiv>
                    )}
                </AnimatePresence>
            </MotionDiv>
        </div>
    )
}

const CLASS_SECTIONS = [
    { key: "Charter", title: "Charter Command Class" },
    { key: "Alpha", title: "Alpha Avatar Class" },
    { key: "Beta", title: "Beta Bankai Class" },
    { key: "Gamma", title: "Gamma Ga Kill Class" },
    { key: "Delta", title: "Delta Doraemon Class" },
    { key: "Epsilon", title: "Epsilon Evangelion Class" },
    { key: "Zeta", title: "Zeta Z-Fighter Class" },
    { key: "Eta", title: "Eta Edgerunner Class" },
    { key: "Theta", title: "Theta Titan Class" },
]

function BrotherSection({ title, list, images, jumpToBrother, extendedBrother, setExtendedBrother, onDeveloperOpen }) {
    if (!list.length) return null
    return (
        <div className="w-full h-fit mt-12">
            <Title as="h2" text={title} />
            <div className="w-full h-full flex flex-wrap justify-start items-start gap-8 pt-8 overflow-visible">
                {list.map((brother) => (
                    <BrotherCard
                        key={brother.getFullName()}
                        brother={brother}
                        images={images}
                        jumpToBrother={jumpToBrother}
                        extendedBrother={extendedBrother}
                        setExtendedBrother={setExtendedBrother}
                        onDeveloperOpen={onDeveloperOpen}
                    />
                ))}
            </div>
        </div>
    )
}

export default function Brothers() {
    const { brothers, images, loading, error } = useContext(BrothersContext);
    const [extendedBrother, setExtendedBrother] = useState(null);
    const [developerBrother, setDeveloperBrother] = useState(null);
    const [search, setSearch] = useState("");
    const [familyFilter, setFamilyFilter] = useState(() => {
        try {
            return new URLSearchParams(window.location.search).get("family") || "All";
        } catch {
            return "All";
        }
    });
    const [classFilter, setClassFilter] = useState(() => {
        try {
            return new URLSearchParams(window.location.search).get("class") || "All";
        } catch {
            return "All";
        }
    });
    const [boardOnly, setBoardOnly] = useState(false);

    // Deep-link: /brothers#LineName
    useEffect(() => {
        if (!brothers?.length) return;
        const raw = window.location.hash.replace(/^#/, "");
        if (!raw) return;
        const lineName = decodeURIComponent(raw);
        const exists = brothers.some((b) => b.lineName === lineName);
        if (!exists) return;
        const t = setTimeout(() => {
            setExtendedBrother(lineName);
            const el = document.getElementById(lineName);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        }, 0);
        return () => clearTimeout(t);
    }, [brothers]);

    const families = useMemo(() => {
        const set = new Set((brothers || []).map((b) => b.family).filter(Boolean));
        return ["All", ...Array.from(set).sort()];
    }, [brothers]);

    const classes = useMemo(() => {
        return ["All", ...CLASS_SECTIONS.map((c) => c.key)];
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (brothers || []).filter((b) => {
            if (familyFilter !== "All" && b.family !== familyFilter) return false;
            if (classFilter !== "All" && b.crossingClass !== classFilter) return false;
            if (boardOnly && (b.position === "Alumni" || b.position === "Active")) return false;
            if (!q) return true;
            const hay = `${b.firstName} ${b.lastName} ${b.lineName} ${b.major} ${b.hometown}`.toLowerCase();
            return hay.includes(q);
        });
    }, [brothers, search, familyFilter, classFilter, boardOnly]);

    const executiveBoard = filtered.filter(brother => (brother.position !== "Alumni" && brother.position !== "Active"));
    const activeBrothers = filtered.filter(brother => brother.position === "Active");
    const alumniBrothers = filtered.filter(brother => brother.position === "Alumni");

    const jumpToBrother = (brother) => {
        const lineName = brother.lineName;
        setExtendedBrother(lineName);
        window.history.replaceState(null, "", `#${encodeURIComponent(lineName)}`);

        // ponytail: body { overflow-x: hidden } makes scrollIntoView({ behavior: "smooth" })
        // jump instantly in Chrome — window.scrollTo is reliable. Clear filters if the
        // target card isn't mounted, then scroll after paint.
        const doScroll = () => {
            const el = document.getElementById(lineName);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        };

        if (!document.getElementById(lineName)) {
            setSearch("");
            setFamilyFilter("All");
            setClassFilter("All");
            setBoardOnly(false);
            setTimeout(doScroll, 50);
        } else {
            requestAnimationFrame(doScroll);
        }
    };

    const selectClass = "bg-primary border border-tertiary/40 text-text-primary rounded-sm px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";
    const sectionProps = {
        images,
        jumpToBrother,
        extendedBrother,
        setExtendedBrother,
        onDeveloperOpen: setDeveloperBrother,
    };

    return (
        <PageContainer className="pb-20" maxWidthClassName="max-w-7xl">
            <Title as="h1" text="Brothers" />

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
                <label className="sr-only" htmlFor="brother-search">Search brothers</label>
                <input
                    id="brother-search"
                    type="search"
                    placeholder="Search name, major, hometown…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`${selectClass} w-full sm:w-64`}
                />
                <label className="sr-only" htmlFor="family-filter">Family</label>
                <select id="family-filter" className={selectClass} value={familyFilter} onChange={(e) => setFamilyFilter(e.target.value)}>
                    {families.map((f) => <option key={f} value={f}>{f === "All" ? "All Families" : f}</option>)}
                </select>
                <label className="sr-only" htmlFor="class-filter">Crossing class</label>
                <select id="class-filter" className={selectClass} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                    {classes.map((c) => <option key={c} value={c}>{c === "All" ? "All Classes" : c}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={boardOnly}
                        onChange={(e) => setBoardOnly(e.target.checked)}
                        className="accent-[var(--accent-color)]"
                    />
                    Board only
                </label>
            </div>

            {loading && <p className="mt-8 text-text-secondary">Loading brothers…</p>}
            {error && <p className="mt-8 text-text-secondary">Couldn’t load brothers: {error}</p>}
            {!loading && !error && filtered.length === 0 && (
                <p className="mt-8 text-text-secondary">No brothers match these filters.</p>
            )}

            <BrotherSection title="Executive Board" list={executiveBoard} {...sectionProps} />
            <BrotherSection title="Active Brothers" list={activeBrothers} {...sectionProps} />
            <BrotherSection title="Alumni Brothers" list={alumniBrothers} {...sectionProps} />
            {CLASS_SECTIONS.map(({ key, title }) => (
                <BrotherSection
                    key={key}
                    title={title}
                    list={filtered.filter((b) => b.crossingClass === key)}
                    {...sectionProps}
                />
            ))}

            <AnimatePresence>
                {developerBrother && (
                    <DeveloperEgg
                        key="dev-egg"
                        brother={developerBrother}
                        imgSrc={images?.[developerBrother.lineName] || null}
                        onClose={() => setDeveloperBrother(null)}
                        jumpToBrother={jumpToBrother}
                    />
                )}
            </AnimatePresence>
        </PageContainer>
    )
}