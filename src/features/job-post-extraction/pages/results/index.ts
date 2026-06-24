import { clearCurrentScanData, getCurrentScan, getScanData } from "../../storage/scans-store";
import { exportCsv } from "./export";
import { getVisiblePosts } from "./filters";
import { getResultsElements, renderPage, renderPosts } from "./render";

const elements = getResultsElements();

let currentScanData = { scan: null, posts: [] };
let visiblePosts = [];

document.addEventListener("DOMContentLoaded", initializePage);

async function initializePage() {
  bindEvents();
  await loadPosts();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", renderFilteredPosts);
  elements.extractedFromInput.addEventListener("change", renderFilteredPosts);
  elements.extractedToInput.addEventListener("change", renderFilteredPosts);
  elements.clearFiltersButton.addEventListener("click", clearFilters);
  elements.refreshButton.addEventListener("click", loadPosts);
  elements.exportCsvButton.addEventListener("click", () => exportCsv(visiblePosts));
  elements.deleteAllButton.addEventListener("click", deleteAllPosts);
}

async function loadPosts() {
  const scan = await getCurrentScan();
  currentScanData = scan ? await getScanData(scan.id) : { scan: null, posts: [] };
  visiblePosts = getFilteredPosts();
  renderPage(elements, currentScanData, visiblePosts);
}

function renderFilteredPosts() {
  visiblePosts = getFilteredPosts();
  renderPosts(elements, visiblePosts);
}

function getFilteredPosts() {
  return getVisiblePosts(currentScanData.posts, {
    query: elements.searchInput.value,
    extractedFrom: elements.extractedFromInput.value,
    extractedTo: elements.extractedToInput.value
  });
}

function clearFilters() {
  elements.searchInput.value = "";
  elements.extractedFromInput.value = "";
  elements.extractedToInput.value = "";
  renderFilteredPosts();
}

async function deleteAllPosts() {
  if (currentScanData.posts.length === 0) {
    return;
  }

  const confirmed = window.confirm("Delete all saved posts from the current scan?");
  if (!confirmed) {
    return;
  }

  await clearCurrentScanData();
  currentScanData = { scan: null, posts: [] };
  clearFilters();
  renderPage(elements, currentScanData, visiblePosts);
}
