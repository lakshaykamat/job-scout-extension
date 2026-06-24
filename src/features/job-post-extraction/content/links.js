(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function extractLinks(element) {
    return scanner.queryAll("a[href]", element)
      .map((link) => createLinkDetails(link))
      .filter((link) => link.url);
  }

  function createLinkDetails(link) {
    const url = toAbsoluteUrl(link.getAttribute("href"));
    const resolvedUrl = resolveLinkedInRedirect(url);
    const hostname = getHostname(resolvedUrl || url);

    return {
      text: scanner.normalizeText(link.innerText || link.getAttribute("aria-label") || ""),
      url,
      resolvedUrl,
      hostname,
      isExternal: Boolean(hostname) && hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com"),
      isProfile: url.includes("/in/"),
      isHashtag: url.includes("keywords=%23") || scanner.normalizeText(link.innerText || "").startsWith("#")
    };
  }

  function extractHashtags(element, text) {
    const linkTags = extractLinks(element)
      .filter((link) => link.isHashtag)
      .map((link) => link.text || getHashtagFromUrl(link.url));
    const textTags = text.match(/#[\p{L}\p{N}_]+/gu) || [];

    return scanner.uniqueStrings([...linkTags, ...textTags]
      .map((tag) => tag.startsWith("#") ? tag : `#${tag}`)
      .map((tag) => tag.trim()));
  }

  function extractMedia(element) {
    return scanner.queryAll("img[src]", element)
      .map((image) => ({
        src: image.src,
        alt: image.getAttribute("alt") || ""
      }))
      .filter((image) => image.src);
  }

  function extractPreview(links, media, authorImageUrl) {
    const externalLinks = links.filter((candidate) => candidate.isExternal);
    const link = externalLinks.find((candidate) => candidate.text && !candidate.text.startsWith("http")) || externalLinks[0];
    if (!link) {
      return null;
    }

    const previewImage = media.find((image) => image.src !== authorImageUrl);

    return {
      title: link.text.split(/\n/).map((line) => line.trim()).filter(Boolean)[0] || "",
      url: link.url,
      resolvedUrl: link.resolvedUrl,
      hostname: link.hostname,
      imageUrl: previewImage?.src || ""
    };
  }

  function resolveLinkedInRedirect(url) {
    try {
      const parsedUrl = new URL(url);
      const redirectedUrl = parsedUrl.searchParams.get("url");
      return redirectedUrl || url;
    } catch {
      return url;
    }
  }

  function getHashtagFromUrl(url) {
    try {
      const keyword = new URL(url).searchParams.get("keywords") || "";
      return decodeURIComponent(keyword);
    } catch {
      return "";
    }
  }

  function getHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  function toAbsoluteUrl(url) {
    try {
      return new URL(url, window.location.origin).href;
    } catch {
      return "";
    }
  }

  Object.assign(scanner, {
    extractHashtags,
    extractLinks,
    extractMedia,
    extractPreview,
    toAbsoluteUrl
  });
})();
