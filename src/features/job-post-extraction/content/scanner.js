(() => {
  const scanner = globalThis.LinkedInHiringScanner;
  const { MESSAGE_TYPES } = scanner;

  const scanState = {
    isRunning: false,
    shouldStop: false,
    seenIds: new Set(),
    scanId: ""
  };

  async function startScan(options) {
    if (scanState.isRunning) {
      return;
    }

    scanState.isRunning = true;
    scanState.shouldStop = false;
    scanState.seenIds = new Set();
    scanState.scanId = options.scanId;

    try {
      await scanPage(options);
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.scanFinished,
        scanId: options.scanId,
        wasStopped: scanState.shouldStop
      });
    } finally {
      scanState.isRunning = false;
      scanState.scanId = "";
    }
  }

  async function scanPage(options) {
    await waitForPostElements(10000);

    let idleBottomRounds = 0;
    let round = 0;
    const maxRounds = 120;

    while (!scanState.shouldStop) {
      round += 1;
      const seenBeforeRound = scanState.seenIds.size;
      const expandedPosts = scanner.expandVisiblePosts();
      if (expandedPosts > 0) {
        await scanner.wait(150);
      }

      const posts = collectPosts();

      if (posts.length > 0) {
        await chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.scanBatch,
          scanId: options.scanId,
          posts
        });
      }

      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.scanProgress,
        scanId: options.scanId,
        seenCount: scanState.seenIds.size,
        activity: describeProgress(posts.length)
      });

      const foundNewPosts = scanState.seenIds.size > seenBeforeRound;
      idleBottomRounds = scanner.isAtPageBottom() && !foundNewPosts ? idleBottomRounds + 1 : 0;

      if (idleBottomRounds >= 3 || round >= maxRounds) {
        break;
      }

      scanner.scrollPage();
      await scanner.wait(options.scrollDelayMs);
    }
  }

  function collectPosts() {
    const elements = scanner.findPostElements();
    const posts = [];

    for (const element of elements) {
      const post = scanner.extractPost(element);

      if (!post || scanState.seenIds.has(post.id)) {
        continue;
      }

      scanState.seenIds.add(post.id);
      posts.push(post);
    }

    return posts;
  }

  async function waitForPostElements(timeoutMilliseconds) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMilliseconds) {
      if (scanner.findPostElements().length > 0) {
        return;
      }

      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.scanProgress,
        scanId: scanState.scanId,
        seenCount: 0,
        activity: "Waiting for LinkedIn result cards to load"
      });
      await scanner.wait(500);
    }

    throw new Error("No LinkedIn result cards found. Wait for the content results to load, then start again.");
  }

  function describeProgress(newPostCount) {
    if (newPostCount > 0) {
      return `Checked ${scanState.seenIds.size} posts. Found ${newPostCount} new posts on this scroll.`;
    }

    return `Checked ${scanState.seenIds.size} posts. Scrolling for more results.`;
  }

  function stopScan() {
    scanState.shouldStop = true;
  }

  function getScanState() {
    return {
      isRunning: scanState.isRunning,
      scanId: scanState.scanId
    };
  }

  Object.assign(scanner, {
    getScanState,
    startScan,
    stopScan
  });
})();
