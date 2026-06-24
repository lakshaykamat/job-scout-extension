import {
  LINKEDIN_CONTENT_SEARCH_PATTERN,
  MESSAGE_TYPES,
  SCAN_STATUS
} from "../config/runtime-constants.js";
import { getSettings } from "../storage/settings-store.js";
import {
  createScan,
  getCurrentScan,
  getScanData,
  mergePosts,
  updateScan
} from "../storage/scans-store.js";
import { getMatchingPosts } from "./post-filter.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    stopRunningScanForTab(tabId, "Page reloaded. Start a new scan when the results finish loading.")
      .catch((error) => console.warn("Could not stop scan after reload.", error));
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  stopRunningScanForTab(tabId, "Source tab closed.")
    .catch((error) => console.warn("Could not stop scan after tab close.", error));
});

async function handleMessage(message) {
  if (message.type === MESSAGE_TYPES.startScan) {
    return startScan(message.tabId, message.url, message.profileId);
  }

  if (message.type === MESSAGE_TYPES.stopScan) {
    await chrome.tabs.sendMessage(message.tabId, { type: MESSAGE_TYPES.stopScan });
    return { ok: true };
  }

  if (message.type === MESSAGE_TYPES.scanBatch) {
    return processScanBatch(message.scanId, message.posts);
  }

  if (message.type === MESSAGE_TYPES.scanProgress) {
    return updateScanProgress(message.scanId, message.seenCount, message.activity);
  }

  if (message.type === MESSAGE_TYPES.scanFinished) {
    return finishScan(message.scanId, message.wasStopped);
  }

  if (message.type === MESSAGE_TYPES.scanFailed) {
    return failScan(message.scanId, message.error);
  }

  return { ok: false, error: "Unknown message type." };
}

async function startScan(tabId, url, profileId) {
  if (!LINKEDIN_CONTENT_SEARCH_PATTERN.test(url || "")) {
    throw new Error("Open a LinkedIn content search results page before starting.");
  }

  const settings = await getSettings();
  const currentScan = await getCurrentScan();
  if (currentScan?.status === SCAN_STATUS.running) {
    throw new Error(`A scan is already running with ${currentScan.profile?.name || "one profile"}. Stop it before starting another.`);
  }

  const profile = settings.profiles.find((item) => item.id === profileId);
  if (!profile) {
    throw new Error("Choose one scan profile before starting.");
  }

  const scan = await createScan(url, profile, tabId);
  notifyPopup(scan);

  await chrome.tabs.sendMessage(tabId, {
    type: MESSAGE_TYPES.startScan,
    scanId: scan.id,
    scrollDelayMs: settings.scrollDelayMs
  });

  return { ok: true, scan };
}

async function stopRunningScanForTab(tabId, activity) {
  const scan = await getCurrentScan();
  if (scan?.status !== SCAN_STATUS.running || scan.sourceTabId !== tabId) {
    return;
  }

  const updatedScan = await updateScan(scan.id, {
    status: SCAN_STATUS.stopped,
    lastActivity: activity
  });
  notifyPopup(updatedScan);
}

async function processScanBatch(scanId, posts) {
  const { scan } = await getScanData(scanId);
  if (!scan?.profile) {
    throw new Error("Scan profile was not found.");
  }

  const matchingPosts = getMatchingPosts(posts, scan.profile);
  await mergePosts(scanId, matchingPosts);
  const updatedScan = await updateScan(scanId, {});
  notifyPopup(updatedScan);

  return {
    ok: true,
    savedCount: matchingPosts.length,
    skippedCount: posts.length - matchingPosts.length
  };
}

async function updateScanProgress(scanId, seenCount, activity) {
  const scan = await updateScan(scanId, {
    seenCount: Number.isFinite(seenCount) ? seenCount : 0,
    lastActivity: activity || "Scanning LinkedIn results"
  });
  notifyPopup(scan);
  return { ok: true };
}

async function finishScan(scanId, wasStopped) {
  const status = wasStopped ? SCAN_STATUS.stopped : SCAN_STATUS.complete;
  const scan = await updateScan(scanId, { status });
  notifyPopup(scan);
  return { ok: true };
}

async function failScan(scanId, error) {
  const scan = await updateScan(scanId, {
    status: SCAN_STATUS.error,
    error: error || "Scan failed."
  });
  notifyPopup(scan);
  return { ok: true };
}

function notifyPopup(scan) {
  chrome.runtime.sendMessage({ type: MESSAGE_TYPES.scanUpdated, scan }).catch(() => {});
}
