/**
 * Optional per-asset gallery metadata keyed by source filename stem
 * (matches Vite hashed URLs like `1bgimg-CvXx5i-a.jpeg`).
 * Flip `featured` when new assets land — no CMS needed.
 */
const GALLERY_META = {
  "1bgimg": { featured: true },
  bgimg2: { featured: true },
  "2": { featured: true },
  "lfe-hug": { featured: true },
}

/** @param {string} noExt filename without extension */
function longestMetaKey(noExt) {
  let best = null
  let bestLen = -1
  for (const key of Object.keys(GALLERY_META)) {
    if ((noExt === key || noExt.startsWith(`${key}-`)) && key.length > bestLen) {
      best = key
      bestLen = key.length
    }
  }
  return best
}

/** @param {string} url */
export function fileStemFromUrl(url) {
  const file = decodeURIComponent((url || "").split("/").pop() || "")
  const noExt = file.replace(/\.[^.]+$/, "")
  const known = longestMetaKey(noExt)
  if (known) return known
  // Unknown asset: strip trailing Vite hash (`name-Ab12CdEf`)
  const hashMatch = noExt.match(/^(.+)-[A-Za-z0-9]{8}$/)
  return hashMatch ? hashMatch[1] : noExt
}

/** @param {string} url */
export function metaForUrl(url) {
  const stem = fileStemFromUrl(url)
  return GALLERY_META[stem] || {}
}

/**
 * Split gallery URLs into hero, filmstrip (up to 3), and mosaic remainder.
 * If nothing is marked featured, first image is the hero and the next two filmstrip.
 * @param {string[]} urls
 */
export function partitionGallery(urls) {
  const list = Array.isArray(urls) ? urls : []
  if (list.length === 0) {
    return { hero: null, heroIndex: -1, filmstrip: [], mosaic: [], items: [] }
  }

  const items = list.map((url, index) => ({
    url,
    index,
    ...metaForUrl(url),
  }))

  let featured = items.filter((item) => item.featured)
  if (featured.length === 0) {
    featured = items.slice(0, Math.min(3, items.length)).map((item) => ({
      ...item,
      featured: true,
    }))
  }

  const hero = featured[0]
  const filmstrip = featured.slice(1, 4)
  const featuredIndexes = new Set([hero.index, ...filmstrip.map((f) => f.index)])
  const mosaic = items.filter((item) => !featuredIndexes.has(item.index))

  return {
    hero,
    heroIndex: hero.index,
    filmstrip,
    mosaic,
    items,
  }
}
