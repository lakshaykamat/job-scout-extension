import { escapeAttribute, escapeHtml } from "../../../../shared/dom";
import { formatStatus, formatTime } from "../../../../shared/format";
import { LINKEDIN_CONTENT_SEARCH_PATTERN, SCAN_STATUS } from "../../config/runtime-constants";

export function getPopupElements(): any {
  return {
    pageStatus: document.querySelector("#pageStatus"),
    profileSelect: document.querySelector("#profileSelect"),
    profileHint: document.querySelector("#profileHint"),
    activeProfileName: document.querySelector("#activeProfileName"),
    optionsButton: document.querySelector("#optionsButton"),
    startButton: document.querySelector("#startButton"),
    stopButton: document.querySelector("#stopButton"),
    scanStatus: document.querySelector("#scanStatus"),
    scanActivity: document.querySelector("#scanActivity"),
    postCount: document.querySelector("#postCount"),
    checkedCount: document.querySelector("#checkedCount"),
    savedResultCount: document.querySelector("#savedResultCount"),
    errorText: document.querySelector("#errorText"),
    viewPostsButton: document.querySelector("#viewPostsButton"),
    exportJsonButton: document.querySelector("#exportJsonButton"),
    exportCsvButton: document.querySelector("#exportCsvButton"),
    clearButton: document.querySelector("#clearButton"),
    resultCount: document.querySelector("#resultCount"),
    resultsList: document.querySelector("#resultsList")
  };
}

export function renderPageStatus(elements, activeTab) {
  const isLinkedInSearch = LINKEDIN_CONTENT_SEARCH_PATTERN.test(activeTab?.url || "");
  elements.pageStatus.textContent = isLinkedInSearch
    ? "Ready on LinkedIn content search"
    : "Open the LinkedIn content search page";
}

export function renderProfiles(elements, settings) {
  elements.profileSelect.innerHTML = [
    "<option value=\"\">Choose one profile</option>",
    ...settings.profiles
      .map((profile) => `<option value="${escapeAttribute(profile.id)}">${escapeHtml(profile.name)}</option>`)
  ].join("");
  elements.profileSelect.value = "";
  renderProfileHint(elements, null);
}

export function renderProfileHint(elements, profile) {
  if (!profile) {
    elements.profileHint.textContent = "No profile selected.";
    elements.activeProfileName.textContent = "No profile";
    return;
  }

  elements.activeProfileName.textContent = profile.name;
  elements.profileHint.textContent = profile.primaryKeywords.slice(0, 5).join(", ");
}

export function renderScanData(elements, scanData) {
  const { scan, posts } = scanData;

  elements.scanStatus.textContent = getStatusLabel(scan);
  elements.postCount.textContent = String(scan?.postCount || posts.length);
  elements.checkedCount.textContent = String(scan?.seenCount || posts.length);
  elements.savedResultCount.textContent = String(posts.length);
  elements.stopButton.disabled = scan?.status !== SCAN_STATUS.running;
  elements.resultCount.textContent = String(posts.length);
  renderScanActivity(elements, scan, posts.length);

  if (scan?.profile) {
    elements.activeProfileName.textContent = scan.profile.name;
  }

  renderSavedPosts(elements, posts);
}

export function showError(elements, message) {
  elements.errorText.hidden = false;
  elements.errorText.textContent = message;
}

export function hideError(elements) {
  elements.errorText.hidden = true;
  elements.errorText.textContent = "";
}

function getStatusLabel(scan) {
  if (scan?.status === SCAN_STATUS.running) {
    return "Scanning running";
  }

  return scan ? formatStatus(scan.status) : "Idle";
}

function renderScanActivity(elements, scan, savedCount) {
  if (scan?.status !== SCAN_STATUS.running) {
    elements.scanActivity.className = "mt-3 rounded-md border border-line bg-white p-3 text-xs leading-5 text-stone-600";
    elements.scanActivity.textContent = scan
      ? `Last scan ${formatStatus(scan.status).toLowerCase()} with ${scan.profile?.name || "selected profile"}. ${scan.lastActivity || ""}`.trim()
      : "No scan running.";
    return;
  }

  elements.scanActivity.className = "mt-3 rounded-md border border-moss bg-mint p-3 text-xs font-bold leading-5 text-moss";
  elements.scanActivity.innerHTML = `
    <span class="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-moss"></span>
    Scanning running with ${escapeHtml(scan.profile?.name || "selected profile")}. ${escapeHtml(scan.lastActivity || "Scrolling results")}. Saved ${savedCount}. Updated ${formatTime(scan.updatedAt)}.
  `;
}

function renderSavedPosts(elements, posts) {
  if (posts.length === 0) {
    elements.resultsList.innerHTML = "<p class=\"rounded-lg border border-dashed border-line bg-card p-5 text-center text-sm text-stone-500\">No saved hiring posts yet.</p>";
    return;
  }

  elements.resultsList.innerHTML = posts
    .slice(-20)
    .reverse()
    .map(renderPostCard)
    .join("");
}

function renderPostCard(post) {
  const authorInitial = (post.author || "?").slice(0, 1);

  return `
    <article class="result-card">
      <div class="post-icon">${escapeHtml(authorInitial)}</div>
      <div class="min-w-0">
        <h3 class="truncate text-sm font-black">${escapeHtml(post.author || "Unknown author")}</h3>
        <p class="mt-1 text-xs text-stone-500">${escapeHtml([post.connectionDegree, post.timestamp].filter(Boolean).join(" - ") || "Saved post")}</p>
        <p class="mt-2 line-clamp-3 text-xs leading-5 text-stone-700">${escapeHtml(post.text || "")}</p>
        <a class="mt-2 inline-block text-xs font-black text-moss hover:text-ink" href="${escapeAttribute(post.url || "#")}" target="_blank" rel="noreferrer">Open post</a>
      </div>
    </article>
  `;
}
