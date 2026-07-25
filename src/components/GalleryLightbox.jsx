import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

const MotionImg = motion.img

/**
 * Full-screen gallery viewer: arrows, keyboard, swipe, counter.
 * @param {{ images: string[], active: number | null, onClose: () => void, onChange: (index: number) => void }} props
 */
export default function GalleryLightbox({ images, active, onClose, onChange }) {
  const reduced = useReducedMotion()
  const touchStartX = useRef(null)
  const closeRef = useRef(null)

  const open = active !== null && images[active]
  const total = images.length

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    function onKey(e) {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") {
        e.preventDefault()
        onChange((active - 1 + total) % total)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onChange((active + 1) % total)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [open, active, total, onClose, onChange])

  if (!open) return null

  function go(delta) {
    onChange((active + delta + total) % total)
  }

  function onTouchStart(e) {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
  }

  function onTouchEnd(e) {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const dx = (e.changedTouches[0]?.clientX ?? start) - start
    if (Math.abs(dx) < 48) return
    go(dx < 0 ? 1 : -1)
  }

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.28, ease: "easeOut" }

  return createPortal(
    <div
      className="fixed inset-0 z-100 bg-black/90 flex flex-col items-center justify-center px-4 pt-16 pb-10"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery lightbox"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 text-white text-base underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        onClick={onClose}
      >
        <X className="size-5" aria-hidden />
        Close
      </button>

      <p className="absolute top-4 left-4 z-10 text-white/80 text-sm tabular-nums" aria-live="polite">
        {active + 1} / {total}
      </p>

      <button
        type="button"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Previous photo"
        onClick={(e) => {
          e.stopPropagation()
          go(-1)
        }}
      >
        <ChevronLeft className="size-8 sm:size-10" />
      </button>

      <button
        type="button"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        aria-label="Next photo"
        onClick={(e) => {
          e.stopPropagation()
          go(1)
        }}
      >
        <ChevronRight className="size-8 sm:size-10" />
      </button>

      <div
        className="relative flex max-h-[calc(100dvh-6.5rem)] max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <MotionImg
            key={images[active]}
            src={images[active]}
            alt={`Gallery photo ${active + 1}`}
            className="max-h-[calc(100dvh-7.5rem)] max-w-full object-contain select-none"
            initial={reduced ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -24 }}
            transition={transition}
            draggable={false}
          />
        </AnimatePresence>
      </div>
    </div>,
    document.body
  )
}
