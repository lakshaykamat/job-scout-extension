import { escapeAttribute, escapeHtml } from "../../../../shared/dom";
import { formatDate, formatStatus } from "../../../../shared/format";

export function getResultsElements(): any {
  return {
    scanMeta: document.querySelector("#scanMeta"),
    searchInput: document.querySelector("#searchInput"),
    extractedFromInput: document.querySelector("#extractedFromInput"),
    extractedToInput: document.querySelector("#extractedToInput"),
    clearFiltersButton: document.querySelector("#clearFiltersButton"),
    refreshButton: document.querySelector("#refreshButton"),
    exportCsvButton: document.querySelector("#exportCsvButton"),
    deleteAllButton: document.querySelector("#deleteAllButton"),
    savedCount: document.querySelector("#savedCount"),
    visibleCount: document.querySelector("#visibleCount"),
    profileName: document.querySelector("#profileName"),
    postsList: document.querySelector("#postsList")
  };
}

export function renderPage(elements, scanData, visiblePosts) {
  const { scan, posts } = scanData;
  elements.scanMeta.textContent = scan
    ? `${formatStatus(scan.status)} scan from ${formatDate(scan.startedAt)}`
    : "No saved scan found.";
  elements.savedCount.textContent = String(posts.length);
  elements.visibleCount.textContent = String(visiblePosts.length);
  elements.profileName.textContent = scan?.profile?.name || "None";
  elements.deleteAllButton.disabled = posts.length === 0;
  renderPosts(elements, visiblePosts);
}

export function renderPosts(elements, posts) {
  elements.visibleCount.textContent = String(posts.length);

  if (posts.length === 0) {
    elements.postsList.innerHTML = "<p class=\"panel p-8 text-center text-sm text-stone-500\">No saved posts match this search.</p>";
    return;
  }

  elements.postsList.innerHTML = posts.map(renderPostCard).join("");
}

function renderPostCard(post) {
  return `
    <article class="panel mx-auto max-w-2xl overflow-hidden bg-white">
      <div class="p-4">
        <div class="flex items-start gap-3">
          ${renderAuthorImage(post)}
          <div class="min-w-0 flex-1">
            <a class="font-black text-ink hover:text-moss" href="${escapeAttribute(post.authorProfileUrl || "#")}" target="_blank" rel="noreferrer">${escapeHtml(post.author || "Unknown author")}</a>
            <p class="mt-0.5 line-clamp-2 text-xs leading-5 text-stone-500">${escapeHtml(post.authorHeadline || "")}</p>
            <p class="mt-0.5 text-xs text-stone-500">${escapeHtml([post.connectionDegree, post.timestamp].filter(Boolean).join(" - ") || "Saved post")}</p>
            <p class="mt-0.5 text-xs text-stone-500">Extracted ${escapeHtml(formatDate(post.foundAt))}</p>
          </div>
        </div>

        <div class="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink">${escapeHtml(post.text)}</div>
        ${renderPreview(post)}
        ${renderEngagement(post)}
      </div>
      <div class="border-t border-line px-4 py-3">
        ${renderPostDetails(post)}
      </div>
    </article>
  `;
}

function renderAuthorImage(post) {
  if (!post.authorImageUrl) {
    return `<div class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mint text-sm font-black text-moss">${escapeHtml((post.author || "?").slice(0, 1))}</div>`;
  }

  return `<img class="h-12 w-12 shrink-0 rounded-full object-cover" src="${escapeAttribute(post.authorImageUrl)}" alt="${escapeAttribute(post.author || "Author")}">`;
}

function renderPreview(post) {
  if (!post.preview) {
    return renderMedia(post);
  }

  return `
    <a class="mt-4 block overflow-hidden rounded-lg border border-line bg-card hover:bg-mint" href="${escapeAttribute(post.preview.resolvedUrl || post.preview.url)}" target="_blank" rel="noreferrer">
      ${post.preview.imageUrl ? `<img class="h-44 w-full object-cover" src="${escapeAttribute(post.preview.imageUrl)}" alt="">` : ""}
      <div class="p-3">
        <p class="text-sm font-black text-ink">${escapeHtml(post.preview.title || "Open link")}</p>
        <p class="mt-1 text-xs text-stone-500">${escapeHtml(post.preview.hostname || "")}</p>
      </div>
    </a>
  `;
}

function renderMedia(post) {
  const media = (post.media || []).filter((image) => image.src !== post.authorImageUrl);
  if (media.length === 0) {
    return "";
  }

  return `
    <div class="mt-4 overflow-hidden rounded-lg border border-line">
      <img class="h-56 w-full object-cover" src="${escapeAttribute(media[0].src)}" alt="${escapeAttribute(media[0].alt || "")}">
    </div>
  `;
}

function renderEngagement(post) {
  const engagement = post.engagement || {};
  const reactions = Number(engagement.reactions || 0);
  const comments = Number(engagement.comments || 0);
  const reposts = Number(engagement.reposts || 0);

  return `
    <div class="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-stone-500">
      <span>${reactions} reactions</span>
      <span>${comments} comments - ${reposts} reposts</span>
    </div>
    <div class="mt-2 grid grid-cols-4 border-t border-line pt-2 text-center text-sm font-bold text-stone-600">
      <span>Like</span>
      <span>Comment</span>
      <span>Repost</span>
      <span>Send</span>
    </div>
  `;
}

function renderPostDetails(post) {
  return `
    <details>
      <summary class="cursor-pointer text-xs font-bold uppercase tracking-wide text-stone-500">Saved details</summary>
      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <div class="rounded-lg border border-line bg-card p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-stone-500">Author</p>
          ${renderDetail("Name", post.author)}
          ${renderDetail("Headline", post.authorHeadline)}
          ${renderDetail("Connection", post.connectionDegree)}
          ${renderDetail("Profile", post.authorProfileUrl)}
        </div>
        <div class="rounded-lg border border-line bg-card p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-stone-500">Links</p>
          ${renderLinks(post.externalLinks || post.links || [])}
        </div>
        <div class="rounded-lg border border-line bg-card p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-stone-500">Post data</p>
          ${renderDetail("Hashtags", (post.hashtags || []).join(", "))}
          ${renderDetail("Reactions", post.engagement?.reactions)}
          ${renderDetail("Comments", post.engagement?.comments)}
          ${renderDetail("Reposts", post.engagement?.reposts)}
          ${renderDetail("Preview", post.preview?.title)}
          ${renderDetail("Preview host", post.preview?.hostname)}
          ${renderDetail("Extracted at", formatDate(post.foundAt))}
          ${renderDetail("Saved URL", post.url)}
        </div>
      </div>
    </details>
  `;
}

function renderDetail(label, value) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  return `
    <p class="mt-2 break-words text-xs leading-5 text-stone-700">
      <span class="font-bold text-stone-500">${escapeHtml(label)}:</span>
      ${escapeHtml(String(value))}
    </p>
  `;
}

function renderLinks(links) {
  if (links.length === 0) {
    return "<p class=\"mt-2 text-xs text-stone-500\">No links saved.</p>";
  }

  return links.slice(0, 8).map((link) => `
    <a class="mt-2 block break-words text-xs font-bold leading-5 text-moss hover:text-ink" href="${escapeAttribute(link.resolvedUrl || link.url)}" target="_blank" rel="noreferrer">
      ${escapeHtml(link.text || link.hostname || link.resolvedUrl || link.url)}
    </a>
  `).join("");
}
