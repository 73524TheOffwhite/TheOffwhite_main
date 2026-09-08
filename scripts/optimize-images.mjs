/**
 * High-quality image compression in place / to WebP for photo PNGs.
 * Keeps max edge at 2560 (4096 for panoramas). Does not change app logic.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DIRS = [
  "src/assets",
  "src/artonplate",
  "src/offwhite images",
  "public",
];

/** Keep true PNG (transparency / brand marks). */
const KEEP_PNG = new Set([
  "logo-dark.png",
  "logo-light.png",
  "contact-enquiry-leaf.png",
  "testimonials-decor.png",
]);

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function isPano(file) {
  return file.replace(/\\/g, "/").includes("/panos/");
}

async function isEffectivelyOpaque(input) {
  const { channels, hasAlpha } = await sharp(input).metadata();
  if (!hasAlpha) return true;
  // Sample alpha: if min alpha is 255, fully opaque
  const { channels: stats } = await sharp(input).ensureAlpha().stats();
  const alpha = stats[channels - 1] || stats[3];
  return alpha && alpha.min >= 254;
}

async function optimizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!IMAGE_EXT.has(ext)) return null;

  const base = path.basename(file);
  const before = fs.statSync(file).size;
  const maxEdge = isPano(file) ? 4096 : 2560;
  const quality = isPano(file) ? 88 : 86;

  const meta = await sharp(file, { failOn: "none" }).metadata();
  if (!meta.width || !meta.height) return null;

  let pipeline = sharp(file, { failOn: "none" }).rotate();

  if (meta.width > maxEdge || meta.height > maxEdge) {
    pipeline = pipeline.resize(maxEdge, maxEdge, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const tmp = `${file}.opt.tmp`;

  // JPEG / WebP: recompress in place
  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality, mozjpeg: true, progressive: true }).toFile(tmp);
    replaceIfSmaller(file, tmp, before);
    return { file, action: "jpeg", before, after: fs.statSync(file).size };
  }

  if (ext === ".webp") {
    await pipeline.webp({ quality: Math.min(quality + 2, 90), effort: 6 }).toFile(tmp);
    replaceIfSmaller(file, tmp, before);
    return { file, action: "webp", before, after: fs.statSync(file).size };
  }

  // PNG
  if (ext === ".png") {
    const keepPng = KEEP_PNG.has(base);
    const opaque = await isEffectivelyOpaque(file);

    if (keepPng || !opaque) {
      await pipeline
        .png({ compressionLevel: 9, quality: 90, effort: 10 })
        .toFile(tmp);
      replaceIfSmaller(file, tmp, before);
      return { file, action: "png", before, after: fs.statSync(file).size };
    }

    // Photo PNG → high-quality JPEG (same basename), then rewrite imports
    const jpgPath = file.replace(/\.png$/i, ".jpg");
    await pipeline.jpeg({ quality: 88, mozjpeg: true, progressive: true }).toFile(tmp);
    const after = fs.statSync(tmp).size;
    if (after >= before * 0.98) {
      // Not worth converting
      fs.unlinkSync(tmp);
      return { file, action: "skip", before, after: before };
    }
    if (fs.existsSync(jpgPath) && path.resolve(jpgPath) !== path.resolve(file)) {
      // Avoid clobbering an existing different jpg with same name
      fs.unlinkSync(tmp);
      await sharp(file, { failOn: "none" })
        .rotate()
        .resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true })
        .png({ compressionLevel: 9, quality: 90, effort: 10 })
        .toFile(tmp);
      replaceIfSmaller(file, tmp, before);
      return { file, action: "png-fallback", before, after: fs.statSync(file).size };
    }
    fs.renameSync(tmp, jpgPath);
    fs.unlinkSync(file);
    return {
      file,
      action: "png-to-jpg",
      before,
      after,
      from: base,
      to: path.basename(jpgPath),
    };
  }

  return null;
}

function replaceIfSmaller(original, tmp, before) {
  const after = fs.statSync(tmp).size;
  if (after < before) {
    fs.renameSync(tmp, original);
  } else {
    fs.unlinkSync(tmp);
  }
}

function rewriteImports(renames) {
  if (!renames.length) return 0;
  const codeRoots = ["src"];
  const codeFiles = [];
  for (const d of codeRoots) {
    walk(path.join(root, d), codeFiles);
  }
  const targets = codeFiles.filter((f) => /\.(ts|tsx|js|jsx|css|md)$/i.test(f));

  let touched = 0;
  for (const codeFile of targets) {
    let text = fs.readFileSync(codeFile, "utf8");
    let next = text;
    for (const { from, to } of renames) {
      // Replace filename occurrences (imports, globs, strings)
      next = next.split(from).join(to);
    }
    if (next !== text) {
      fs.writeFileSync(codeFile, next);
      touched++;
    }
  }
  return touched;
}

const files = DIRS.flatMap((d) => walk(path.join(root, d))).filter((f) =>
  IMAGE_EXT.has(path.extname(f).toLowerCase()),
);

console.log(`Optimizing ${files.length} images…`);

const renames = [];
let saved = 0;
let beforeTotal = 0;
let afterTotal = 0;

for (const file of files) {
  try {
    const result = await optimizeFile(file);
    if (!result) continue;
    beforeTotal += result.before;
    afterTotal += result.after ?? result.before;
    saved += result.before - (result.after ?? result.before);
    if (result.action === "png-to-jpg") {
      renames.push({ from: result.from, to: result.to });
      console.log(
        `✓ ${result.from} → ${result.to}  ${(result.before / 1e6).toFixed(2)}MB → ${(result.after / 1e6).toFixed(2)}MB`,
      );
    } else if (result.action !== "skip") {
      const a = result.after ?? result.before;
      if (a < result.before) {
        console.log(
          `✓ ${path.relative(root, result.file)}  ${(result.before / 1e6).toFixed(2)}MB → ${(a / 1e6).toFixed(2)}MB`,
        );
      }
    }
  } catch (err) {
    console.warn(`! skip ${path.relative(root, file)}: ${err.message}`);
  }
}

const filesTouched = rewriteImports(renames);
console.log(
  `\nDone. Saved ~${(saved / 1e6).toFixed(1)}MB (${(beforeTotal / 1e6).toFixed(1)} → ${(afterTotal / 1e6).toFixed(1)} MB). Updated ${filesTouched} source files for ${renames.length} renames.`,
);
