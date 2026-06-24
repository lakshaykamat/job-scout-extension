(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function normalizeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function cleanMultilineText(text) {
    return String(text || "")
      .split(/\n+/)
      .map((line) => normalizeText(line))
      .filter(Boolean)
      .join("\n");
  }

  function getUsefulLines(text) {
    return String(text || "")
      .split(/\n+/)
      .map((line) => normalizeText(line))
      .filter(Boolean);
  }

  function normalizeComparableText(text) {
    return normalizeText(String(text || "")
      .toLowerCase()
      .replace(/…\s*more\b/g, "")
      .replace(/\b(like|comment|repost|send|follow)\b/g, " "));
  }

  function hashText(text) {
    let hash = 0;

    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash).toString(36);
  }

  function toNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

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
