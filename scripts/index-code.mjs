#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT_DIR = process.cwd();

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".cache",
  ".turbo",
  "dist",
  "build",
  "out",
  "coverage",
  ".idea",
  ".vscode",
  "venv",
  ".venv",
]);

const BINARY_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "ico",
  "bmp",
  "tiff",
  "tif",
  "psd",
  "ai",
  "eps",
  "pdf",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "zip",
  "gz",
  "tar",
  "rar",
  "7z",
  "bz2",
  "xz",
  "mp3",
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "wav",
  "flac",
  "exe",
  "dll",
  "bin",
  "dat",
  "class",
  "jar",
  "wasm",
]);

const MAX_FILE_BYTES = 512 * 1024; // 512KB per file

const TEXTLIKE_EXTENSIONS = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "json",
  "md",
  "markdown",
  "txt",
  "yml",
  "yaml",
  "env",
  "css",
  "scss",
  "sass",
  "pcss",
  "less",
  "html",
  "htm",
  "xml",
  "svg",
  "py",
  "toml",
  "ini",
  "cfg",
]);

const SENSITIVE_FILE_PATTERNS = [
  /firebase-adminsdk/i,
  /service-account/i,
  /secret/i,
  /credentials?/i,
  /^\.env(\..*)?$/i,
];

function isSensitive(filename) {
  const base = path.basename(filename);
  return SENSITIVE_FILE_PATTERNS.some((re) => re.test(base));
}

function getLanguageByExtension(ext) {
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "py":
      return "python";
    case "json":
      return "json";
    case "md":
    case "markdown":
      return "markdown";
    case "css":
    case "scss":
    case "sass":
    case "pcss":
    case "less":
      return "css";
    case "yml":
    case "yaml":
      return "yaml";
    case "html":
    case "htm":
      return "html";
    default:
      return "text";
  }
}

function shouldIndexFile(filePath, stats) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return false;
  if (isSensitive(filePath)) return false;
  if (stats.size > MAX_FILE_BYTES) return false;
  // Heuristic: allow common text-like files, otherwise skip unknown extensions over 64KB
  if (!TEXTLIKE_EXTENSIONS.has(ext) && stats.size > 64 * 1024) return false;
  return true;
}

function listFilesRecursively(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...listFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizePath(p) {
  return p.replace(/\\/g, "/");
}

function chunkContentByLines(content, maxLinesPerChunk = 400) {
  const lines = content.split(/\r?\n/);
  const chunks = [];
  for (let i = 0; i < lines.length; i += maxLinesPerChunk) {
    const slice = lines.slice(i, i + maxLinesPerChunk);
    chunks.push({
      startLine: i + 1,
      endLine: i + slice.length,
      content: slice.join("\n"),
    });
  }
  return chunks;
}

function hashContent(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function buildIndex() {
  const allFiles = listFilesRecursively(ROOT_DIR);
  const indexedFiles = [];
  for (const absPath of allFiles) {
    const relPath = path.relative(ROOT_DIR, absPath);
    // Skip top-level artifacts we know we don't want
    if (relPath === "code-index.json") continue;
    try {
      const stats = fs.statSync(absPath);
      if (!shouldIndexFile(absPath, stats)) continue;
      const content = fs.readFileSync(absPath, "utf8");
      const ext = path.extname(absPath).slice(1).toLowerCase();
      const record = {
        path: normalizePath(relPath),
        size: stats.size,
        mtimeMs: stats.mtimeMs,
        language: getLanguageByExtension(ext),
        hash: hashContent(content),
        numLines: content.split(/\r?\n/).length,
        chunks: chunkContentByLines(content),
      };
      indexedFiles.push(record);
    } catch (err) {
      // Best-effort: skip unreadable files
    }
  }
  const index = {
    generatedAt: new Date().toISOString(),
    root: path.basename(ROOT_DIR),
    totalFilesIndexed: indexedFiles.length,
    files: indexedFiles,
  };
  return index;
}

function main() {
  const index = buildIndex();
  const outPath = path.join(ROOT_DIR, "code-index.json");
  fs.writeFileSync(outPath, JSON.stringify(index, null, 2), "utf8");
  console.log(
    `Indexed ${index.totalFilesIndexed} files → ${path.relative(
      ROOT_DIR,
      outPath
    )}`
  );
}

main();
