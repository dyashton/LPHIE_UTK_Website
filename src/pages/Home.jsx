import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useState, useEffect, useContext, useMemo, useRef } from "react"
import { Link } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import Papa from "papaparse"
import { BrothersContext } from "../providers/BrothersContext"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import InstagramStrip from "../components/InstagramStrip"

const MotionDiv = motion.div
const MotionH1 = motion.h1

// ponytail: rAF scrollLeft marquee; pause on hover/interact so users can drag/wheel freely
function useBrotherhoodAutoScroll(enabled) {
  const ref = useRef(null)

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let hovering = false
    let pausedUntil = 0
    const pause = () => {
      pausedUntil = performance.now() + 3000
    }
    const onEnter = () => {
      hovering = true
    }
    const onLeave = () => {
      hovering = false
    }
    // Duplicate list → wrap at halfway for a seamless loop (also while dragging)
    const onScroll = () => {
      const half = el.scrollWidth / 2
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half
    }

    el.addEventListener("pointerenter", onEnter)
    el.addEventListener("pointerleave", onLeave)
    el.addEventListener("pointerdown", pause)
    el.addEventListener("wheel", pause, { passive: true })
    el.addEventListener("touchstart", pause, { passive: true })
    el.addEventListener("scroll", onScroll, { passive: true })

    const tick = () => {
      if (!hovering && performance.now() >= pausedUntil) {
        el.scrollLeft += 0.35
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointerenter", onEnter)
      el.removeEventListener("pointerleave", onLeave)
      el.removeEventListener("pointerdown", pause)
      el.removeEventListener("wheel", pause)
      el.removeEventListener("touchstart", pause)
      el.removeEventListener("scroll", onScroll)
    }
  }, [enabled])

  return ref
}

function useTimelineEvents() {
  const [events, setEvents] = useState([])
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/datasets/timeline")
        if (!res.ok) throw new Error("timeline")
        const payload = await res.json()
        const results = Papa.parse(payload.csvText, { header: true, skipEmptyLines: true })
        const parsed = results.data.map((item) => ({
          date: item.date,
          title: item.title,
          description: item.description,
          imageIndex: item.imageIndex !== undefined && item.imageIndex !== "" ? Number(item.imageIndex) : null,
        }))
        if (!cancelled) {
          setEvents(parsed)
          setStatus("ok")
        }
      } catch {
        if (!cancelled) setStatus("error")
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { events, status }
}

export default function Home() {
  const [imgIndex, setImgIndex] = useState(0)
  const [spotlightIndex, setSpotlightIndex] = useState(0)
  const { homeImages, brothers, images, galleryImages, loading } = useContext(BrothersContext)
  const reducedMotion = useReducedMotion()
  const { events: timelineEvents, status: timelineStatus } = useTimelineEvents()

  const recentEvents = useMemo(() => {
    if (!timelineEvents.length) return []
    return timelineEvents.slice(-4).reverse()
  }, [timelineEvents])

  const portraitBrothers = useMemo(() => {
    // Active house only (exclude alumni)
    return (brothers || [])
      .filter((b) => b.position !== "Alumni" && images?.[b.lineName])
      .slice(0, 12)
  }, [brothers, images])

  const alumniHighlights = useMemo(() => {
    return (brothers || [])
      .filter((b) => b.position === "Alumni" && images?.[b.lineName])
      .slice(0, 3)
  }, [brothers, images])

  const spotlightPool = useMemo(() => {
    const actives = (brothers || []).filter(
      (b) => b.position !== "Alumni" && images?.[b.lineName]
    )
    return actives.length ? actives : portraitBrothers
  }, [brothers, images, portraitBrothers])

  const spotlight = spotlightPool[spotlightIndex % Math.max(spotlightPool.length, 1)] || null

  const stats = useMemo(() => {
    const classes = new Set((brothers || []).map((b) => b.crossingClass).filter(Boolean))
    return {
      brothers: brothers?.length || 0,
      classes: classes.size,
      years: Math.max(1, new Date().getFullYear() - 2020),
    }
  }, [brothers])

  useEffect(() => {
    if (reducedMotion) return
    if (!Array.isArray(homeImages) || homeImages.length <= 1) return
    const interval = setInterval(() => {
      setImgIndex((prevIndex) => (prevIndex + 1) % homeImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [homeImages, reducedMotion])

  useEffect(() => {
    if (reducedMotion || spotlightPool.length <= 1) return
    const t = setInterval(() => {
      setSpotlightIndex((i) => (i + 1) % spotlightPool.length)
    }, 6000)
    return () => clearInterval(t)
  }, [spotlightPool.length, reducedMotion])

  const heroImageUrl =
    Array.isArray(homeImages) && homeImages.length
      ? homeImages[imgIndex % homeImages.length]
      : null

  const previewGallery = (galleryImages || []).slice(0, 6)
  const stripRef = useBrotherhoodAutoScroll(!reducedMotion && portraitBrothers.length > 0)
  const stripItems = reducedMotion
    ? portraitBrothers
    : [...portraitBrothers, ...portraitBrothers]

  return (
    <div className="w-full relative pb-0">
      {/* Hero — brand only */}
      <div className="relative w-full min-h-dvh">
        <div className="absolute inset-0 w-full h-full bg-linear-to-b from-primary via-background to-background" />
        {heroImageUrl && !reducedMotion ? (
          <AnimatePresence>
            <MotionDiv
              key={imgIndex}
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${heroImageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.5,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>
        ) : heroImageUrl ? (
          <div
            className="absolute inset-0 w-full h-full opacity-50"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-background/90 via-background/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

        <PageContainer paddedTop={false} className="relative z-10 min-h-dvh flex flex-col justify-start pt-24 sm:pt-28 lg:pt-32 pb-28" maxWidthClassName="max-w-7xl">
          <div className="max-w-5xl">
            <MotionH1
              className="font-cinzel text-text-primary tracking-[0.04em] leading-[0.95] text-[clamp(2.75rem,8vw,7.5rem)] drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]"
              initial={reducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="block">Lambda Phi</span>
              <span className="block mt-1 sm:mt-2 text-accent">Epsilon</span>
            </MotionH1>

            <MotionDiv
              className="mt-8 sm:mt-10 h-px w-16 sm:w-24 bg-accent"
              initial={reducedMotion ? false : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />

            <MotionDiv
              className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            >
              <p className="mt-6 sm:mt-8 text-text-primary text-lg sm:text-2xl lg:text-3xl font-cinzel tracking-wide">
                University of Tennessee, Knoxville
              </p>
              <p className="mt-4 sm:mt-5 text-text-primary text-base sm:text-lg max-w-md leading-relaxed">
                Beta Kappa Chapter — leadership, culture, and lifelong brotherhood.
              </p>
              <Link
                to="/brothers"
                className="mt-8 inline-block font-cinzel text-accent text-lg underline underline-offset-8 decoration-accent/70 hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                Meet the Brothers
              </Link>
            </MotionDiv>
          </div>
        </PageContainer>

        <button
          type="button"
          aria-label="Scroll down"
          className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 text-text-primary/80 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 rounded-full p-2"
          onClick={() => {
            document.getElementById("home-below-fold")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          <MotionDiv
            animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
            transition={reducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" strokeWidth={1.5} />
          </MotionDiv>
        </button>
      </div>

      {/* Stats — below hero */}
      <div id="home-below-fold">
      <PageContainer paddedTop={false} className="py-10 border-y border-tertiary/15" maxWidthClassName="max-w-7xl">
        <Reveal className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-cinzel text-3xl sm:text-5xl text-accent">{loading ? "—" : stats.brothers}</div>
            <div className="mt-1 text-text-secondary text-sm sm:text-base">Brothers</div>
          </div>
          <div>
            <div className="font-cinzel text-3xl sm:text-5xl text-accent">{loading ? "—" : stats.classes}</div>
            <div className="mt-1 text-text-secondary text-sm sm:text-base">Crossing Classes</div>
          </div>
          <div>
            <div className="font-cinzel text-3xl sm:text-5xl text-accent">{stats.years}+</div>
            <div className="mt-1 text-text-secondary text-sm sm:text-base">Years at UTK</div>
          </div>
        </Reveal>
      </PageContainer>
      </div>

      {/* Brotherhood strip */}
      <PageContainer className="py-16" maxWidthClassName="max-w-7xl" paddedTop={false}>
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Our Brotherhood</h2>
              <p className="mt-2 text-text-secondary max-w-xl">
                Faces of Beta Kappa — meet the men who make the chapter.
              </p>
            </div>
            <Link
              to="/brothers"
              className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 shrink-0"
            >
              View all brothers →
            </Link>
          </div>
          <div ref={stripRef} className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {portraitBrothers.length === 0 && (
              <p className="text-text-secondary">{loading ? "Loading brothers…" : "Portraits coming soon."}</p>
            )}
            {stripItems.map((b, i) => (
              <Link
                key={`${b.lineName}-${i}`}
                to={`/brothers#${encodeURIComponent(b.lineName)}`}
                className="shrink-0 w-28 sm:w-36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <div className="aspect-3/4 overflow-hidden bg-primary">
                  <img
                    src={images[b.lineName]}
                    alt={b.getFullName()}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-sm font-cinzel text-accent truncate">&quot;{b.lineName}&quot;</p>
              </Link>
            ))}
          </div>
        </Reveal>
      </PageContainer>

      {/* Featured brother + explore CTAs */}
      <PageContainer className="pb-16" maxWidthClassName="max-w-7xl" paddedTop={false}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <Reveal>
            <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Brother Spotlight</h2>
            {spotlight ? (
              <Link
                to={`/brothers#${encodeURIComponent(spotlight.lineName)}`}
                className="mt-6 flex gap-5 items-start group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <div className="w-28 h-36 sm:w-36 sm:h-44 shrink-0 overflow-hidden bg-primary">
                  <img
                    src={images[spotlight.lineName]}
                    alt={spotlight.getFullName()}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl text-text-primary">
                    {spotlight.firstName}{" "}
                    <span className="font-cinzel text-accent">&quot;{spotlight.lineName}&quot;</span>{" "}
                    {spotlight.lastName}
                  </p>
                  <p className="mt-1 text-text-secondary">{spotlight.major}</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    {spotlight.family} Family · {spotlight.getCrossingClass()}
                  </p>
                </div>
              </Link>
            ) : (
              <p className="mt-4 text-text-secondary">Loading spotlight…</p>
            )}
          </Reveal>

          <Reveal delay={0.05}>
            <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Explore the Chapter</h2>
            <ul className="mt-6 space-y-4 text-lg">
              <li>
                <Link to="/chapter-timeline" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  Chapter Timeline
                </Link>
                <span className="text-text-secondary"> — from founding to Beta Kappa</span>
              </li>
              <li>
                <Link to="/family-tree" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  Family Tree
                </Link>
                <span className="text-text-secondary"> — lineage across schools</span>
              </li>
              <li>
                <Link to="/gallery" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  Gallery
                </Link>
                <span className="text-text-secondary"> — culture in photos</span>
              </li>
              <li>
                <Link to="/philanthropy" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                  Philanthropy
                </Link>
                <span className="text-text-secondary"> — Be The Match</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </PageContainer>

      {/* Recent events from timeline */}
      <PageContainer className="pb-16" maxWidthClassName="max-w-7xl" paddedTop={false}>
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Recent Chapter History</h2>
            <Link
              to="/chapter-timeline"
              className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              Full timeline →
            </Link>
          </div>
          {timelineStatus === "loading" && <p className="text-text-secondary">Loading events…</p>}
          {timelineStatus === "error" && <p className="text-text-secondary">Couldn’t load timeline events.</p>}
          {timelineStatus === "ok" && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentEvents.map((event) => (
                <li key={`${event.date}-${event.title}`}>
                  <h3 className="font-bold text-accent text-lg sm:text-xl">{event.title}</h3>
                  <div className="text-text-secondary text-sm sm:text-base">— {event.date} —</div>
                  <p className="mt-1 text-sm sm:text-base text-text-primary/90">{event.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </PageContainer>

      {/* Gallery teaser */}
      {previewGallery.length > 0 && (
        <PageContainer className="pb-16" maxWidthClassName="max-w-7xl" paddedTop={false}>
          <Reveal>
            <div className="flex justify-between items-end mb-6">
              <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Culture</h2>
              <Link to="/gallery" className="text-accent underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                Gallery →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {previewGallery.map((url) => (
                <div key={url} className="aspect-4/3 overflow-hidden bg-primary">
                  <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </Reveal>
        </PageContainer>
      )}

      {/* Alumni highlights */}
      {alumniHighlights.length > 0 && (
        <PageContainer className="pb-16" maxWidthClassName="max-w-7xl" paddedTop={false}>
          <Reveal>
            <h2 className="font-cinzel text-3xl sm:text-4xl text-accent">Alumni</h2>
            <p className="mt-2 text-text-secondary max-w-xl">Brothers who paved the way — still part of the family.</p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {alumniHighlights.map((b) => (
                <Link
                  key={b.lineName}
                  to={`/brothers#${encodeURIComponent(b.lineName)}`}
                  className="flex gap-4 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <img
                    src={images[b.lineName]}
                    alt={b.getFullName()}
                    className="w-16 h-20 object-cover bg-primary shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-cinzel text-accent">&quot;{b.lineName}&quot;</p>
                    <p className="text-sm text-text-secondary">{b.firstName} {b.lastName}</p>
                    <p className="text-xs text-text-secondary mt-1">{b.getCrossingClass()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </PageContainer>
      )}

      <PageContainer className="pb-20" maxWidthClassName="max-w-7xl" paddedTop={false}>
        <Reveal>
          <InstagramStrip />
        </Reveal>
      </PageContainer>
    </div>
  )
}
