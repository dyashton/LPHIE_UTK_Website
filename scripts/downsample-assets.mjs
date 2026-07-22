/**
 * One-shot: rewrite src/assets/{portraits,home,rush} to web sizes.
 * Matches compressImage.js presets (portrait 900px/350KB, hero 1920px/750KB).
 *
 * Usage: node scripts/downsample-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "src", "assets");

const PRESETS = {
  portraits: { maxEdge: 900, maxBytes: 350 * 1024, quality: 82 },
  home: { maxEdge: 1920, maxBytes: 750 * 1024, quality: 85 },
  rush: { maxEdge: 1920, maxBytes: 750 * 1024, quality: 85 },
};

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE_EXT.has(path.extname(e.name).toLowerCase()))
    .map((e) => path.join(dir, e.name));
}

async function encodeJpeg(pipeline, quality) {
  return pipeline.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
}

/** Shrink until under maxBytes (or quality floor). */
async function fitJpeg(pipeline, maxBytes, startQuality) {
  let quality = startQuality;
  let buf = await encodeJpeg(pipeline, quality);
  while (buf.length > maxBytes && quality > 50) {
    quality -= 5;
    buf = await encodeJpeg(pipeline, quality);
  }
  return { buf, quality };
}

async function processFile(filePath, preset) {
  const before = (await fs.stat(filePath)).size;
  const ext = path.extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);

  // Photo folders: flatten any alpha onto site background, always JPEG.
  // (Many portrait PNGs declare alpha but are opaque photos.)
  const pipeline = sharp(filePath, { failOn: "none" })
    .rotate()
    .flatten({ background: { r: 39, g: 39, b: 39 } })
    .resize({
      width: preset.maxEdge,
      height: preset.maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });

  const { buf, quality } = await fitJpeg(pipeline, preset.maxBytes, preset.quality);
  const outPath = ext === ".jpg" || ext === ".jpeg" ? filePath : `${base}.jpg`;

  if (buf.length >= before && outPath === filePath) {
    return { filePath, before, after: before, skipped: "no-gain" };
  }

  await fs.writeFile(outPath, buf);
  if (outPath !== filePath) await fs.unlink(filePath);

  return { filePath: outPath, before, after: buf.length, quality, converted: outPath !== filePath };
}

function fmt(n) {
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  const summary = [];

  for (const [folder, preset] of Object.entries(PRESETS)) {
    const dir = path.join(ROOT, folder);
    let files;
    try {
      files = await listImages(dir);
    } catch {
      console.warn(`skip missing ${folder}/`);
      continue;
    }

    console.log(`\n== ${folder}/ (${files.length} images, max ${preset.maxEdge}px / ${fmt(preset.maxBytes)}) ==`);
    for (const file of files) {
      try {
        const result = await processFile(file, preset);
        summary.push(result);
        const name = path.basename(result.filePath);
        if (result.skipped) {
          console.log(`  skip  ${path.basename(file)} (${result.skipped})`);
        } else {
          const pct = ((1 - result.after / result.before) * 100).toFixed(0);
          console.log(
            `  ${fmt(result.before)} → ${fmt(result.after)} (−${pct}%)  ${name}` +
              (result.converted ? "  [→jpg]" : "") +
              (result.quality != null ? `  q${result.quality}` : "")
          );
        }
      } catch (err) {
        console.error(`  FAIL ${file}:`, err.message);
      }
    }
  }

  const before = summary.reduce((s, r) => s + r.before, 0);
  const after = summary.reduce((s, r) => s + r.after, 0);
  console.log(`\nTotal: ${fmt(before)} → ${fmt(after)} (−${((1 - after / before) * 100).toFixed(0)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
