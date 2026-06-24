import { STORAGE_KEYS } from "../config/runtime-constants.js";

export async function createScan(sourceUrl, profile, sourceTabId) {
  const id = `scan-${Date.now()}`;
  const scan = {
    id,
    status: "running",
    sourceUrl,
    sourceTabId,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    postCount: 0,
    seenCount: 0,
    lastActivity: "Starting scan",
    profile,
    error: ""
  };

  const data = await chrome.storage.local.get([
    STORAGE_KEYS.scans,
    STORAGE_KEYS.postsByScan
  ]);

  await chrome.storage.local.set({
    [STORAGE_KEYS.currentScanId]: id,
    [STORAGE_KEYS.scans]: { ...(data[STORAGE_KEYS.scans] || {}), [id]: scan },
    [STORAGE_KEYS.postsByScan]: { ...(data[STORAGE_KEYS.postsByScan] || {}), [id]: [] }
  });

  return scan;
}

export async function getCurrentScan() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.currentScanId, STORAGE_KEYS.scans]);
  const id = data[STORAGE_KEYS.currentScanId];
  return id ? data[STORAGE_KEYS.scans]?.[id] || null : null;
}

export async function getScanData(scanId) {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.scans,
    STORAGE_KEYS.postsByScan
  ]);

  return {
    scan: data[STORAGE_KEYS.scans]?.[scanId] || null,
    posts: data[STORAGE_KEYS.postsByScan]?.[scanId] || []
  };
}

export async function updateScan(scanId, updates) {
  const data = await chrome.storage.local.get(STORAGE_KEYS.scans);
  const scans = data[STORAGE_KEYS.scans] || {};
  const currentScan = scans[scanId];

  if (!currentScan) {
    return null;
  }

  const nextScan = { ...currentScan, ...updates, updatedAt: Date.now() };
  await chrome.storage.local.set({
    [STORAGE_KEYS.scans]: { ...scans, [scanId]: nextScan }
  });
  return nextScan;
}

export async function mergePosts(scanId, newPosts) {
  const data = await chrome.storage.local.get([STORAGE_KEYS.postsByScan, STORAGE_KEYS.scans]);
  const postsByScan = data[STORAGE_KEYS.postsByScan] || {};
  const existingPosts = postsByScan[scanId] || [];
  const existingIds = new Set(existingPosts.map((post) => post.id));
  const uniquePosts = [];

  for (const post of newPosts) {
    if (existingIds.has(post.id)) {
      continue;
    }

    existingIds.add(post.id);
    uniquePosts.push(post);
  }

  const posts = [...existingPosts, ...uniquePosts];
  const scans = data[STORAGE_KEYS.scans] || {};
  const scan = scans[scanId];

  await chrome.storage.local.set({
    [STORAGE_KEYS.postsByScan]: { ...postsByScan, [scanId]: posts },
    [STORAGE_KEYS.scans]: {
      ...scans,
      [scanId]: {
        ...scan,
        postCount: posts.length,
        updatedAt: Date.now()
      }
    }
  });

  return uniquePosts;
}

export async function clearCurrentScanData() {
  await chrome.storage.local.remove([
    STORAGE_KEYS.currentScanId,
    STORAGE_KEYS.scans,
    STORAGE_KEYS.postsByScan,
    "analysesByScan"
  ]);
}
