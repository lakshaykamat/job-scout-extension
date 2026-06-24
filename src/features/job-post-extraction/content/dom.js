(() => {
  const scanner = globalThis.LinkedInHiringScanner;

  function queryAll(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements.filter(Boolean)));
  }

  function uniqueStrings(values) {
    return Array.from(new Set(values.filter(Boolean)));
  }

  Object.assign(scanner, {
    queryAll,
    uniqueElements,
    uniqueStrings
  });
})();
