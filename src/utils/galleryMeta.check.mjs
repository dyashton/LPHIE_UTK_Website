/**
 * ponytail: assert stem matching + partition — fails if gallery meta logic breaks.
 * Run: node src/utils/galleryMeta.check.mjs
 */
import {
  fileStemFromUrl,
  metaForUrl,
  partitionGallery,
} from "./galleryMeta.js"

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

assert(
  fileStemFromUrl("/assets/1bgimg-CvXx5i-a.jpeg") === "1bgimg",
  "stem strips vite hash"
)
assert(
  fileStemFromUrl("/assets/lfe-hug-AbCdEf12.jpg") === "lfe-hug",
  "stem keeps hyphenated names"
)
assert(metaForUrl("/assets/1bgimg-CvXx5i-a.jpeg").featured === true, "1bgimg featured")
assert(metaForUrl("/assets/lfe-hug-AbCdEf12.jpg").featured === true, "lfe-hug featured")
assert(fileStemFromUrl("/assets/lfe-hug-AbCdEf12.jpg") === "lfe-hug", "hyphenated stem vs hash")
assert(metaForUrl("/assets/lfe-spin-wheel-AbCdEf12.jpg").label === undefined, "no labels")

const urls = [
  "/assets/1bgimg-aaa.jpeg",
  "/assets/bgimg2-bbb.jpeg",
  "/assets/2-ccc.jpg",
  "/assets/4-ddd.jpg",
  "/assets/lfe-hug-eee.jpg",
  "/assets/lfe-spin-wheel-fff.jpg",
]
const { hero, filmstrip, mosaic } = partitionGallery(urls)
assert(hero?.index === 0, "hero is first featured")
assert(filmstrip.length === 3, "up to 3 filmstrip")
assert(mosaic.length === 2, "non-featured go to mosaic")
assert(
  !mosaic.some((m) => m.index === hero.index),
  "hero not duplicated in mosaic"
)

const empty = partitionGallery([])
assert(empty.hero === null && empty.mosaic.length === 0, "empty input")

const fallback = partitionGallery(["/assets/unknown-zzz.jpg", "/a.jpg", "/b.jpg"])
assert(fallback.hero?.index === 0, "fallback features first when none marked")
assert(fallback.filmstrip.length === 2, "fallback filmstrip next two")

console.log("galleryMeta.check: ok")
