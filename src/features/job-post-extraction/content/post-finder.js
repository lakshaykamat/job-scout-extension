(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  const containerSelectors = [
    "div.feed-shared-update-v2",
    "div[role='article']",
    "li.reusable-search__result-container",
    "div[data-id*='urn:li:activity']",
    "div[data-urn*='activity']"
  ];

  const textSelectors = [
    "[componentkey^='feed-commentary_']",
    "[data-testid='expandable-text-box']",
    "div.update-components-text",
    "div.feed-shared-inline-show-more-text",
    "div.update-components-update-v2__commentary",
    "div.feed-shared-update-v2__description-wrapper",
    "span.break-words",
    "div[dir='ltr']"
  ];

  const postTextSelectors = [
    "[componentkey^='feed-commentary_']",
    "[data-testid='expandable-text-box']",
    ".update-components-text",
    ".feed-shared-inline-show-more-text",
    ".update-components-update-v2__commentary",
    ".feed-shared-update-v2__description-wrapper"
  ];

  function findPostElements() {
    const containers = containerSelectors.flatMap((selector) => scanner.queryAll(selector));
    const textContainers = textSelectors
      .flatMap((selector) => scanner.queryAll(selector))
      .map(findPostContainer);

    return scanner.uniqueElements([...containers, ...textContainers])
      .filter(isPostElement);
  }

  function findPostContainer(element) {
    const knownContainer = element.closest(containerSelectors.join(","));
    return knownContainer || findReadableAncestor(element);
  }

  function findReadableAncestor(element) {
    let current = element;
    let bestMatch = element;

    while (current?.parentElement && current.parentElement !== document.body) {
      current = current.parentElement;
      const text = scanner.normalizeText(current.innerText || "");

      if (text.length > 180 && text.length < 6000) {
        bestMatch = current;
      }

      if (isPostElement(current)) {
        return current;
      }
    }

    return bestMatch;
  }

  function isPostElement(element) {
    const text = scanner.normalizeText(element.innerText || "");

    if (text.length < 40 || text.length > 8000) {
      return false;
    }

    return hasPostText(text) || hasPostLink(element) || hasPostContent(element);
  }

  function hasPostText(text) {
    const normalizedText = text.toLowerCase();
    return normalizedText.includes("like") && (
      normalizedText.includes("comment") ||
      normalizedText.includes("repost") ||
      normalizedText.includes("send")
    );
  }

  function hasPostLink(element) {
    return Boolean(element.querySelector("a[href*='/feed/update/'], a[href*='activity-'], a[href*='lnkd.in/']"));
  }

  function hasPostContent(element) {
    return postTextSelectors.some((selector) => scanner.normalizeText(element.querySelector(selector)?.innerText || "").length >= 20);
  }

  function expandVisiblePosts() {
    const buttons = Array.from(document.querySelectorAll("button"))
      .filter((button) => isSeeMoreButton(button))
      .slice(0, 8);

    for (const button of buttons) {
      button.click();
    }

    return buttons.length;
  }

  function isSeeMoreButton(button) {
    const label = scanner.normalizeText(`${button.innerText} ${button.getAttribute("aria-label") || ""}`).toLowerCase();
    const isExpandableTextButton = button.getAttribute("data-testid") === "expandable-text-button";
    const isTextMoreButton = label === "more" || label.endsWith(" more");
    const isInsidePostText = Boolean(button.closest(postTextSelectors.join(",")));

    return isExpandableTextButton ||
      label.includes("see more") ||
      label.includes("show more") ||
      (isTextMoreButton && isInsidePostText);
  }

  Object.assign(scanner, {
    expandVisiblePosts,
    findPostElements,
    postTextSelectors
  });
})();
