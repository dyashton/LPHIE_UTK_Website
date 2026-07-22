import { useContext, useState, useEffect } from "react"
import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import InstagramStrip from "../components/InstagramStrip"
import { BrothersContext } from "../providers/BrothersContext"

export default function Gallery() {
  const { galleryImages } = useContext(BrothersContext)
  const [active, setActive] = useState(null)
  const images = Array.isArray(galleryImages) ? galleryImages : []

  useEffect(() => {
    if (active === null) return
    function onKey(e) {
      if (e.key === "Escape") setActive(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active])

  return (
    <PageContainer className="pb-20" maxWidthClassName="max-w-7xl">
      <Title as="h1" text="Gallery" />

      {images.length === 0 ? (
        <p className="mt-10 text-text-secondary">Loading photos…</p>
      ) : (
        <Reveal className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              className="group relative aspect-4/3 overflow-hidden bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              onClick={() => setActive(i)}
              aria-label={`Open gallery photo ${i + 1}`}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </button>
          ))}
        </Reveal>
      )}

      <Reveal className="mt-14">
        <InstagramStrip />
      </Reveal>

      {active !== null && images[active] && (
        <div
          className="fixed inset-0 z-100 bg-black/85 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery lightbox"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-lg underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            onClick={() => setActive(null)}
          >
            Close
          </button>
          <img
            src={images[active]}
            alt=""
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </PageContainer>
  )
}
