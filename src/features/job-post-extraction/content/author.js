(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function extractAuthorDetails(element) {
    const profileLinks = scanner.queryAll("a[href*='/in/']", element);
    const profileLink = profileLinks.find((link) => extractNameFromProfileLink(link)) || profileLinks[0];
    const profileUrl = profileLink ? scanner.toAbsoluteUrl(profileLink.getAttribute("href")) : "";
    const image = profileLink?.querySelector("img") || element.querySelector("img[alt*='profile']");
    const imageAlt = image?.getAttribute("alt") || "";
    const name = extractAuthorName(element, profileLink, imageAlt);

    return {
      name,
      profileUrl,
      headline: extractAuthorHeadline(element, name),
      imageUrl: image?.src || "",
      connectionDegree: extractConnectionDegree(element)
    };
  }

  function extractAuthorName(element, profileLink, imageAlt) {
    const imageName = extractNameFromProfileLabel(imageAlt);
    if (imageName) {
      return imageName;
    }

    const profileLinkName = extractNameFromProfileLink(profileLink);
    if (profileLinkName) {
      return profileLinkName;
    }

    const linkText = scanner.getUsefulLines(profileLink?.innerText || "")
      .map(extractNameFromAuthorLine)
      .find(Boolean);

    return linkText || "Unknown author";
  }

  function extractNameFromProfileLink(profileLink) {
    if (!profileLink) {
      return "";
    }

    const labels = [
      profileLink.getAttribute("aria-label") || "",
      ...scanner.queryAll("[aria-label]", profileLink).map((node) => node.getAttribute("aria-label") || "")
    ];

    for (const label of labels) {
      const name = extractNameFromProfileLabel(label) || extractNameFromAuthorLabel(label);
      if (name) {
        return name;
      }
    }

    return scanner.getUsefulLines(profileLink.innerText || "")
      .map(extractNameFromAuthorLine)
      .find(Boolean) || "";
  }

  function extractNameFromProfileLabel(label) {
    return scanner.normalizeText(label).match(/^View\s+(.+?)(?:'s|’s)\s+profile\b/i)?.[1] || "";
  }

  function extractNameFromAuthorLabel(label) {
    const candidate = scanner.normalizeText(label).split(",")[0]?.trim() || "";
    return isLikelyAuthorName(candidate) ? candidate : "";
  }

  function extractNameFromAuthorLine(line) {
    const candidate = scanner.normalizeText(line).replace(/\s*•.*$/, "");
    return isLikelyAuthorName(candidate) ? candidate : "";
  }

  function isLikelyAuthorName(value) {
    return Boolean(value) &&
      value.length <= 80 &&
      !/^view\b/i.test(value) &&
      !isMetadataLine(value) &&
      !isActionLine(value);
  }

  function extractAuthorHeadline(element, authorName) {
    const lines = scanner.getUsefulLines(element.innerText || "");
    const authorIndex = lines.findIndex((line) => line === authorName);

    if (authorIndex >= 0) {
      return lines.slice(authorIndex + 1)
        .find((line) => !isMetadataLine(line) && !isActionLine(line)) || "";
    }

    return "";
  }

  function extractConnectionDegree(element) {
    const text = scanner.normalizeText(element.innerText || "");
    return text.match(/\b(1st|2nd|3rd\+?)\b/)?.[1] || "";
  }

  function isMetadataLine(line) {
    return /\b(1st|2nd|3rd\+?|now|\d+\s*(m|h|d|w))\b/i.test(line);
  }

  function isActionLine(line) {
    return ["like", "comment", "repost", "send", "follow", "feed post"].includes(line.toLowerCase());
  }

  Object.assign(scanner, {
    extractAuthorDetails
  });
})();
