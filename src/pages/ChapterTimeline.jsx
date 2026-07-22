import Title from "../components/Title"
import { useEffect, useState, useContext } from "react"
import { motion } from "framer-motion"
import Papa from "papaparse";
import { Link } from "react-router-dom"
import PageContainer from "../components/PageContainer"
import { BrothersContext } from "../providers/BrothersContext"

const MotionDiv = motion.div;

/** Map crossing-class titles → Brothers filter query */
function classLinkFromTitle(title) {
  const map = {
    "Charter Command Class": "Charter",
    "Alpha Avatar Class": "Alpha",
    "Beta Bankai Class": "Beta",
    "Gamma Ga Kill Class": "Gamma",
    "Delta Doraemon Class": "Delta",
    "Epsilon Evangelion Class": "Epsilon",
    "Zeta Z-Fighter Class": "Zeta",
    "Eta Edgerunner Class": "Eta",
    "Theta Titan Class": "Theta",
  };
  return map[title] || null;
}

export default function ChapterTimeline() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [expanded, setExpanded] = useState(null);
  const { galleryImages } = useContext(BrothersContext);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/datasets/timeline");
        if (!res.ok) throw new Error("timeline");
        const payload = await res.json();
        const results = Papa.parse(payload.csvText, { header: true, skipEmptyLines: true });

        const events = results.data.map((item) => ({
          date: item.date,
          title: item.title,
          description: item.description,
          imageIndex:
            item.imageIndex !== undefined && item.imageIndex !== ""
              ? Number(item.imageIndex)
              : null,
        }));

        if (!cancelled) {
          setTimelineEvents(events);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <PageContainer className="pb-16">
      <Title as="h1" text="Chapter Timeline" />

      {status === "loading" && <p className="mt-8 text-text-secondary">Loading timeline…</p>}
      {status === "error" && <p className="mt-8 text-text-secondary">Couldn’t load the timeline. Try refreshing.</p>}

      {status === "ok" && (
        <div className="timeline-container mt-6  max-w-3xl">
          <MotionDiv
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="timeline-line border-l-2 border-secondary relative pb-6"
          >
            {timelineEvents.map((item, index) => {
              const classKey = classLinkFromTitle(item.title);
              const media =
                item.imageIndex != null &&
                Number.isFinite(item.imageIndex) &&
                galleryImages?.[item.imageIndex]
                  ? galleryImages[item.imageIndex]
                  : null;
              const isOpen = expanded === index;

              return (
                <div key={`${item.date}-${item.title}`} className="timeline-event mb-5 relative">
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.1, 1) }}
                    className="w-3 h-3 rounded-full bg-accent absolute top-0 -left-[7px]"
                  />
                  <MotionDiv
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.1, 1) + 0.05 }}
                    className="pl-6 relative"
                  >
                    <button
                      type="button"
                      className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-sm"
                      onClick={() => setExpanded(isOpen ? null : index)}
                      aria-expanded={isOpen}
                    >
                      <h3 className="text-base sm:text-lg font-bold leading-snug">
                        {item.date} — {item.title}
                      </h3>
                    </button>
                    <p className="mt-1 text-sm text-text-secondary leading-relaxed">{item.description}</p>

                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        {media && (
                          <div className="max-w-xs aspect-video overflow-hidden bg-primary">
                            <img src={media} alt="" className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        )}
                        {classKey && (
                          <Link
                            to={`/brothers?class=${encodeURIComponent(classKey)}`}
                            className="inline-block text-sm text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                          >
                            Meet the {classKey} class →
                          </Link>
                        )}
                      </div>
                    )}
                    {!isOpen && (media || classKey) && (
                      <button
                        type="button"
                        className="mt-1 text-xs text-accent underline underline-offset-4"
                        onClick={() => setExpanded(index)}
                      >
                        More
                      </button>
                    )}
                  </MotionDiv>
                </div>
              );
            })}
            <div className="w-3 h-3 rounded-full bg-text-primary absolute bottom-0 -left-[7px]" />
          </MotionDiv>
        </div>
      )}
    </PageContainer>
  );
}
