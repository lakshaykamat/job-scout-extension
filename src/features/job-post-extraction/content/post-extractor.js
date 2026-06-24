(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function extractPost(element) {
    const rawText = scanner.cleanMultilineText(element.innerText);
    const text = extractPostText(element) || rawText;

    if (!text) {
      return null;
    }

    const links = scanner.extractLinks(element);
    const media = scanner.extractMedia(element);
    const authorDetails = scanner.extractAuthorDetails(element);
    const timestamp = extractTimestamp(element);

    return {
      id: createPostId(element, text, authorDetails, timestamp),
      text,
      rawText,
      html: element.outerHTML,
      author: authorDetails.name,
      authorProfileUrl: authorDetails.profileUrl,
      authorHeadline: authorDetails.headline,
      authorImageUrl: authorDetails.imageUrl,
      connectionDegree: authorDetails.connectionDegree,
      timestamp,
      url: extractPostUrl(element),
      hashtags: scanner.extractHashtags(element, text),
      links,
      externalLinks: links.filter((link) => link.isExternal),
      media,
      preview: scanner.extractPreview(links, media, authorDetails.imageUrl),
      engagement: extractEngagement(rawText),
      foundAt: Date.now()
    };
  }

  function extractPostText(element) {
    for (const selector of scanner.postTextSelectors) {
      const textElement = element.querySelector(selector);
      const value = getBestText(textElement);
      if (value) {
        return value;
      }
    }

    return "";
  }

  function getBestText(element) {
    if (!element) {
      return "";
    }

    const visibleText = scanner.cleanMultilineText(element.innerText || "");
    const fullText = scanner.cleanMultilineText(getReadableTextContent(element));
    return fullText.length > visibleText.length ? fullText : visibleText;
  }

  function getReadableTextContent(element) {
    const clone = element.cloneNode(true);

    clone.querySelectorAll("button, [aria-hidden='true']").forEach((node) => node.remove());
    clone.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));

    return clone.textContent || "";
  }

  function extractTimestamp(element) {
    const timeElement = element.querySelector("time");
    if (timeElement?.dateTime) {
      return timeElement.dateTime;
    }

    const text = scanner.normalizeText(element.innerText);
    const match = text.match(/\b(\d+\s*(m|h|d|w)|now)\b/i);
    return match ? match[0] : "";
  }

  function extractPostUrl(element) {
    const link = element.querySelector("a[href*='/feed/update/'], a[href*='activity-']");
    return link ? scanner.toAbsoluteUrl(link.getAttribute("href")) : window.location.href;
  }

  function extractEngagement(text) {
    return {
      reactions: scanner.toNumber(text.match(/\b(\d+)\s+reactions?\b/i)?.[1]),
      comments: scanner.toNumber(text.match(/\b(\d+)\s+comments?\b/i)?.[1]),
      reposts: scanner.toNumber(text.match(/\b(\d+)\s+reposts?\b/i)?.[1])
    };
  }

  function createPostId(element, text, authorDetails, timestamp) {
    const linkedInId = getLinkedInPostIdentifier(element);
    if (linkedInId) {
      return linkedInId;
    }

    return `post-${scanner.hashText(createDuplicateKey(text, authorDetails, timestamp))}`;
  }

  function getLinkedInPostIdentifier(element) {
    const elementWithUrn = element.closest("[data-urn], [data-id], [data-activity-urn]") ||
      element.querySelector("[data-urn], [data-id], [data-activity-urn]");
    const urn = elementWithUrn?.getAttribute("data-urn") ||
      elementWithUrn?.getAttribute("data-id") ||
      elementWithUrn?.getAttribute("data-activity-urn") ||
      "";

    if (urn.includes("urn:li:activity") || urn.includes("activity:")) {
      return urn;
    }

    const postLink = element.querySelector("a[href*='/feed/update/'], a[href*='activity-']");
    const postUrl = postLink ? scanner.toAbsoluteUrl(postLink.getAttribute("href")) : "";
    return postUrl && postUrl !== window.location.href ? postUrl : "";
  }

  function createDuplicateKey(text, authorDetails, timestamp) {
    return [
      authorDetails.profileUrl,
      authorDetails.name,
      scanner.normalizeComparableText(timestamp),
      scanner.normalizeComparableText(authorDetails.headline),
      scanner.normalizeComparableText(text).slice(0, 1200)
    ].join("|");
  }

  Object.assign(scanner, {
    extractPost
  });
})();
