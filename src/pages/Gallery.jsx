import { useContext, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Title from "../components/Title"
import PageContainer from "../components/PageContainer"
import Reveal from "../components/Reveal"
import InstagramStrip from "../components/InstagramStrip"
import GalleryLightbox from "../components/GalleryLightbox"
import { BrothersContext } from "../providers/BrothersContext"
import { partitionGallery } from "../utils/galleryMeta"

const MotionImg = motion.img

/** Bento span pattern by mosaic index (md+) */
const BENTO_CLASS = [
  "md:col-span-2 md:row-span-2 aspect-4/3 md:aspect-auto md:min-h-88",
  "aspect-4/3",
  "aspect-4/3",
  "md:col-span-2 aspect-16/9",
  "aspect-4/3",
  "aspect-3/4 md:aspect-4/3",
  "aspect-4/3",
  "md:col-span-2 aspect-16/10",
]

export default function Gallery() {
  const { galleryImages } = useContext(BrothersContext)
  const [active, setActive] = useState(null)
  const reduced = useReducedMotion()
  const images = useMemo(
    () => (Array.isArray(galleryImages) ? galleryImages : []),
    [galleryImages]
  )

  const { hero, filmstrip, mosaic } = useMemo(
    () => partitionGallery(images),
    [images]
  )

  return (
    <PageContainer className="pb-20" maxWidthClassName="max-w-7xl">
      <Title as="h1" text="Gallery" />

      {images.length === 0 ? (
        <p className="mt-10 text-text-secondary">Loading photos…</p>
      ) : (
        <>
          {/* Cinematic featured band */}
          {hero ? (
            <Reveal className="mt-10">
              <div className="flex flex-col gap-3 sm:gap-4">
                <button
                  type="button"
                  className="group relative w-full overflow-hidden bg-primary aspect-16/9 lg:aspect-21/9 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                  onClick={() => setActive(hero.index)}
                  aria-label="Open featured gallery photo"
                >
                  <MotionImg
                    src={hero.url}
                    alt=""
                    className="h-full w-full object-cover"
                    initial={reduced ? false : { opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { duration: 0.9, ease: "easeOut" }
                    }
                  />
                  <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />
                </button>

                {filmstrip.length > 0 ? (
                  <div
                    className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
                    aria-label="Featured photos"
                  >
                    {filmstrip.map((item) => (
                      <button
                        key={item.url}
                        type="button"
                        className="group relative shrink-0 snap-start overflow-hidden bg-primary w-[min(72vw,20rem)] sm:w-[min(40vw,22rem)] aspect-4/3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                        onClick={() => setActive(item.index)}
                        aria-label={`Open gallery photo ${item.index + 1}`}
                      >
                        <img
                          src={item.url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </Reveal>
          ) : null}

          {/* Bento mosaic — remaining photos */}
          {mosaic.length > 0 ? (
            <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:auto-rows-[minmax(10rem,auto)]">
              {mosaic.map((item, i) => (
                <Reveal
                  key={item.url}
                  delay={Math.min(i * 0.06, 0.36)}
                  className={BENTO_CLASS[i % BENTO_CLASS.length]}
                >
                  <button
                    type="button"
                    className="group relative h-full w-full min-h-[10rem] overflow-hidden bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    onClick={() => setActive(item.index)}
                    aria-label={`Open gallery photo ${item.index + 1}`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
                  </button>
                </Reveal>
              ))}
            </div>
          ) : null}
        </>
      )}

      <Reveal className="mt-14">
        <InstagramStrip />
      </Reveal>

      <GalleryLightbox
        images={images}
        active={active}
        onClose={() => setActive(null)}
        onChange={setActive}
      />
    </PageContainer>
  )
}
