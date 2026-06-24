(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function scrollPage() {
    const scrollElement = getScrollElement();
    const distance = Math.round(window.innerHeight * 1.25);
    const previousTop = scrollElement.scrollTop;

    scrollElement.scrollBy({ top: distance, behavior: "auto" });

    if (scrollElement.scrollTop === previousTop) {
      scrollElement.scrollTop = previousTop + distance;
    }

    if (scrollElement.scrollTop === previousTop && scrollElement !== document.scrollingElement) {
      window.scrollBy({ top: distance, behavior: "auto" });
    }
  }

  function isAtPageBottom() {
    const scrollElement = getScrollElement();
    return scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 20;
  }

  function getScrollElement() {
    const candidates = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.querySelector("main"),
      document.querySelector(".scaffold-layout__main"),
      document.querySelector(".scaffold-finite-scroll__content"),
      document.querySelector(".search-results-container")
    ].filter(Boolean);

    return candidates.find(isScrollable) || document.scrollingElement || document.documentElement;
  }

  function isScrollable(element) {
    return element.scrollHeight > element.clientHeight + 50;
  }

  Object.assign(scanner, {
    isAtPageBottom,
    scrollPage
  });
})();
