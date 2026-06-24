import {
  LINKEDIN_CONTENT_SEARCH_PATTERN,
  MESSAGE_TYPES,
  SCAN_STATUS
} from "../../config/runtime-constants.js";
import { getSettings } from "../../storage/settings-store.js";
import {
  clearCurrentScanData,
  getCurrentScan,
  getScanData,
  updateScan
} from "../../storage/scans-store.js";
import { exportCsv, exportJson } from "./export.js";
import {
  getPopupElements,
  hideError,
  renderPageStatus,
  renderProfileHint,
  renderProfiles,
  renderScanData,
  showError
} from "./render.js";

const elements = getPopupElements();

let activeTab = null;
let settings = null;
let currentScanData = { scan: null, posts: [] };

document.addEventListener("DOMContentLoaded", initializePopup);
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === MESSAGE_TYPES.scanUpdated) {
    refreshScanData();
  }
});

async function initializePopup() {
  activeTab = await getActiveTab();
  settings = await getSettings();
  renderPageStatus(elements, activeTab);
  renderProfiles(elements, settings);
  bindEvents();
  await refreshScanData();
  updateStartButtonState();
}

function bindEvents() {
  elements.optionsButton.addEventListener("click", () => chrome.runtime.openOptionsPage());
  elements.profileSelect.addEventListener("change", saveSelectedProfile);
  elements.startButton.addEventListener("click", startScan);
  elements.stopButton.addEventListener("click", stopScan);
  elements.viewPostsButton.addEventListener("click", openPostsPage);
  elements.exportJsonButton.addEventListener("click", () => exportJson(currentScanData));
  elements.exportCsvButton.addEventListener("click", () => exportCsv(currentScanData));
  elements.clearButton.addEventListener("click", clearData);
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

function saveSelectedProfile() {
  renderProfileHint(elements, getSelectedProfile());
  updateStartButtonState();
}

async function startScan() {
  if (!elements.profileSelect.value) {
    showError(elements, "Choose one profile before starting.");
    updateStartButtonState();
    return;
  }

  const response = await chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.startScan,
    tabId: activeTab.id,
    url: activeTab.url,
    profileId: elements.profileSelect.value
  });

  if (!response.ok) {
    showError(elements, response.error);
  }

  await refreshScanData();
}

async function stopScan() {
  if (!activeTab?.id) {
    return;
  }

  await chrome.runtime.sendMessage({
    type: MESSAGE_TYPES.stopScan,
    tabId: activeTab.id
  });
}

async function refreshScanData() {
  const scan = await getActiveScan();
  currentScanData = scan ? await getScanData(scan.id) : { scan: null, posts: [] };
  renderScanData(elements, currentScanData);
  updateStartButtonState();

  if (currentScanData.scan?.error) {
    showError(elements, currentScanData.scan.error);
  } else {
    hideError(elements);
  }
}

async function getActiveScan() {
  const scan = await getCurrentScan();

  if (scan?.status !== SCAN_STATUS.running) {
    return scan;
  }

  return reconcileRunningScan(scan);
}

async function reconcileRunningScan(scan) {
  if (!activeTab?.id) {
    return scan;
  }

  if (scan.sourceTabId && scan.sourceTabId !== activeTab.id) {
    return scan;
  }

  try {
    const response = await chrome.tabs.sendMessage(activeTab.id, { type: MESSAGE_TYPES.getScanState });
    if (response?.isRunning && response.scanId === scan.id) {
      return scan;
    }
  } catch (error) {
    console.warn("Could not verify scanner state.", error);
  }

  const stoppedScan = await updateScan(scan.id, {
    status: SCAN_STATUS.stopped,
    lastActivity: "Page reloaded or the scanner is no longer active."
  });
  return stoppedScan || scan;
}

function getSelectedProfile() {
  return settings.profiles.find((profile) => profile.id === elements.profileSelect.value);
}

function updateStartButtonState() {
  const isLinkedInSearch = LINKEDIN_CONTENT_SEARCH_PATTERN.test(activeTab?.url || "");
  const isScanRunning = currentScanData.scan?.status === SCAN_STATUS.running;
  elements.startButton.disabled = !isLinkedInSearch || !elements.profileSelect.value || isScanRunning;
}

function openPostsPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("src/features/job-post-extraction/pages/results/index.html")
  });
}

async function clearData() {
  await clearCurrentScanData();
  await refreshScanData();
}
