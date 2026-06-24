export function normalizeText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

export function cleanMultilineText(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => normalizeText(line))
    .filter(Boolean)
    .join("\n");
}

export function getUsefulLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => normalizeText(line))
    .filter(Boolean);
}

export function normalizeComparableText(text) {
  return normalizeText(String(text || "")
    .toLowerCase()
    .replace(/…\s*more\b/g, "")
    .replace(/\b(like|comment|repost|send|follow)\b/g, " "));
}

export function hashText(text) {
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

(() => {
  const scanner = globalThis.LinkedInHiringScanner;
  Object.assign(scanner, {
    cleanMultilineText,
    getUsefulLines,
    hashText,
    normalizeComparableText,
    normalizeText,
    toNumber,
    wait
  });
})();
