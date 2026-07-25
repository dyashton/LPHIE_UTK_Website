/** Shared family-tree accents + lineage helpers */

export const FAMILIES = ["Bounce Back", "Olympus", "Uji", "Flight Club"];

export const FAMILY_ACCENT = {
  "Bounce Back": {
    hex: "#5B8A72",
    swatch: "bg-[#5B8A72]",
    stripe: "bg-[#5B8A72]",
    hull: "bg-[#5B8A72]/15 border-[#5B8A72]/40",
    glow: "ring-4 ring-[#5B8A72]/50 drop-shadow-[0_0_16px_rgba(91,138,114,0.75)]",
    edge: "#5B8A72",
  },
  Olympus: {
    hex: "#A67C52",
    swatch: "bg-[#A67C52]",
    stripe: "bg-[#A67C52]",
    hull: "bg-[#A67C52]/15 border-[#A67C52]/40",
    glow: "ring-4 ring-[#A67C52]/50 drop-shadow-[0_0_16px_rgba(166,124,82,0.75)]",
    edge: "#A67C52",
  },
  Uji: {
    hex: "#7A8B9A",
    swatch: "bg-[#7A8B9A]",
    stripe: "bg-[#7A8B9A]",
    hull: "bg-[#7A8B9A]/15 border-[#7A8B9A]/40",
    glow: "ring-4 ring-[#7A8B9A]/50 drop-shadow-[0_0_16px_rgba(122,139,154,0.75)]",
    edge: "#7A8B9A",
  },
  "Flight Club": {
    hex: "#6B8CAE",
    swatch: "bg-[#6B8CAE]",
    stripe: "bg-[#6B8CAE]",
    hull: "bg-[#6B8CAE]/15 border-[#6B8CAE]/40",
    glow: "ring-4 ring-[#6B8CAE]/50 drop-shadow-[0_0_16px_rgba(107,140,174,0.75)]",
    edge: "#6B8CAE",
  },
};

export const REVEAL_MS_PER_DEPTH = 80;

export function normLineKey(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

/**
 * Resolve portrait + Brothers profile for a tree node when CSV IDs drift
 * (e.g. Khōshu vs Khōnshu, D.Law vs D. Law).
 */
export function resolveTreeEnrich({ byLineName, images, brothers }, treeId, label) {
  const imgs = images || {};
  const byLine = byLineName || new Map();
  const list = brothers || [];

  const fromProfile = (profile) => ({
    profile: profile || null,
    imgSrc: (profile && imgs[profile.lineName]) || null,
    hasBrotherProfile: Boolean(profile),
  });

  if (byLine.has(treeId)) return fromProfile(byLine.get(treeId));
  if (imgs[treeId]) {
    return { profile: null, imgSrc: imgs[treeId], hasBrotherProfile: false };
  }

  const quoted = label?.match(/"([^"]+)"/)?.[1];
  if (quoted) {
    if (byLine.has(quoted)) return fromProfile(byLine.get(quoted));
    if (imgs[quoted]) {
      return { profile: null, imgSrc: imgs[quoted], hasBrotherProfile: false };
    }
  }

  // First + last from label: Peyton "Khōshu" Neeley → Peyton Neeley
  const bare = String(label || "")
    .replace(/"/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = bare.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    const hit = list.find((b) => b.firstName === first && b.lastName === last);
    if (hit) return fromProfile(hit);
  }

  const want = normLineKey(treeId);
  for (const [k, b] of byLine) {
    if (normLineKey(k) === want) return fromProfile(b);
  }
  for (const [k, src] of Object.entries(imgs)) {
    if (normLineKey(k) === want) {
      return {
        profile: byLine.get(k) || null,
        imgSrc: src,
        hasBrotherProfile: byLine.has(k),
      };
    }
  }

  // ponytail: typo tolerance for longer line names only (Khōshu↔Khōnshu)
  if (want.length >= 5) {
    let bestKey = null;
    let bestSrc = null;
    let bestDist = 3;
    for (const [k, src] of Object.entries(imgs)) {
      const nk = normLineKey(k);
      if (Math.abs(nk.length - want.length) > 2) continue;
      const d = levenshtein(want, nk);
      if (d < bestDist) {
        bestDist = d;
        bestKey = k;
        bestSrc = src;
      }
    }
    if (bestKey && bestDist <= 2) {
      return {
        profile: byLine.get(bestKey) || null,
        imgSrc: bestSrc,
        hasBrotherProfile: byLine.has(bestKey),
      };
    }
  }

  return { profile: null, imgSrc: null, hasBrotherProfile: false };
}

/** Flat id → row map from CSV-shaped rows */
export function indexRows(rows) {
  const byId = new Map();
  const children = new Map();
  for (const row of rows) {
    byId.set(row.brother, row);
    if (!children.has(row.brother)) children.set(row.brother, []);
  }
  for (const row of rows) {
    if (row.parent && byId.has(row.parent)) {
      children.get(row.parent).push(row.brother);
    }
  }
  return { byId, children };
}

/** Ancestors ∪ self ∪ descendants */
export function lineageIds(rootId, byId, children) {
  const set = new Set();
  if (!rootId || !byId.has(rootId)) return set;
  set.add(rootId);
  let cur = byId.get(rootId);
  while (cur?.parent && byId.has(cur.parent)) {
    set.add(cur.parent);
    cur = byId.get(cur.parent);
  }
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop();
    for (const child of children.get(id) || []) {
      if (!set.has(child)) {
        set.add(child);
        stack.push(child);
      }
    }
  }
  return set;
}
