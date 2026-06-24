import { formatDate } from "../../../../shared/format";

export function getVisiblePosts(posts, filters) {
  const query = filters.query.trim().toLowerCase();
  const extractedFrom = getDateInputTime(filters.extractedFrom);
  const extractedTo = getDateInputTime(filters.extractedTo, true);

  return posts
    .filter((post) => !query || getSearchText(post).includes(query))
    .filter((post) => isWithinExtractedRange(post, extractedFrom, extractedTo))
    .sort((a, b) => Number(b.foundAt || 0) - Number(a.foundAt || 0));
}

function getSearchText(post) {
  return [
    post.text,
    post.rawText,
    post.author,
    post.authorHeadline,
    post.authorProfileUrl,
    post.connectionDegree,
    post.timestamp,
    formatDate(post.foundAt),
    post.url,
    ...(post.hashtags || []),
    ...(post.links || []).map((link) => `${link.text} ${link.resolvedUrl || link.url}`),
    post.preview?.title,
    post.preview?.resolvedUrl,
    post.preview?.hostname
  ].join(" ").toLowerCase();
}

function getDateInputTime(value, isEndOfMinute = false) {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) {
    return null;
  }

  return isEndOfMinute && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? time + 59999 : time;
}

function isWithinExtractedRange(post, fromTime, toTime) {
  if (!fromTime && !toTime) {
    return true;
  }

  const extractedAt = Number(post.foundAt || 0);
  if (!extractedAt) {
    return false;
  }

  return (!fromTime || extractedAt >= fromTime) &&
    (!toTime || extractedAt <= toTime);
}
