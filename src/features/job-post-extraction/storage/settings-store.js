import { DEFAULT_SETTINGS } from "../config/default-profiles.js";
import { STORAGE_KEYS } from "../config/runtime-constants.js";

export async function getSettings() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.settings);
  const storedSettings = data[STORAGE_KEYS.settings] || {};
  const settings = sanitizeSettings(storedSettings);

  if (shouldResaveSettings(storedSettings, settings)) {
    await saveSettings(settings);
  }

  return settings;
}

export async function saveSettings(settings) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.settings]: sanitizeSettings(settings)
  });
}

function sanitizeSettings(settings) {
  const profiles = sanitizeProfiles(settings.profiles);
  const activeProfileId = profiles.some((profile) => profile.id === settings.activeProfileId)
    ? settings.activeProfileId
    : DEFAULT_SETTINGS.activeProfileId;

  return {
    scrollDelayMs: toBoundedNumber(settings.scrollDelayMs, DEFAULT_SETTINGS.scrollDelayMs, 250, 5000),
    activeProfileId,
    profiles
  };
}

function sanitizeProfiles(profiles) {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return cloneProfiles(DEFAULT_SETTINGS.profiles);
  }

  const defaultProfileMap = new Map(DEFAULT_SETTINGS.profiles.map((profile) => [profile.id, profile]));
  const sanitizedProfiles = profiles.map((profile) => sanitizeProfile(profile, defaultProfileMap));
  const profileIds = new Set(sanitizedProfiles.map((profile) => profile.id));

  for (const defaultProfile of DEFAULT_SETTINGS.profiles) {
    if (!profileIds.has(defaultProfile.id)) {
      sanitizedProfiles.push({ ...defaultProfile });
    }
  }

  return sanitizedProfiles;
}

function sanitizeProfile(profile, defaultProfileMap) {
  const defaultProfile = defaultProfileMap.get(profile?.id) || DEFAULT_SETTINGS.profiles[0];

  return {
    id: cleanProfileId(profile?.id || defaultProfile.id),
    name: String(profile?.name || defaultProfile.name).trim(),
    primaryKeywords: cleanKeywordList(profile?.primaryKeywords || defaultProfile.primaryKeywords),
    supportingKeywords: cleanKeywordList(profile?.supportingKeywords || defaultProfile.supportingKeywords),
    locationKeywords: cleanKeywordList(profile?.locationKeywords || defaultProfile.locationKeywords),
    hiringKeywords: cleanKeywordList(profile?.hiringKeywords || defaultProfile.hiringKeywords),
    exclusionKeywords: cleanKeywordList(profile?.exclusionKeywords || defaultProfile.exclusionKeywords || [])
  };
}

function cleanProfileId(id) {
  return String(id).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
}

function cleanKeywordList(keywords) {
  return Array.from(
    new Set(
      [].concat(keywords || [])
        .flatMap((keyword) => String(keyword).split(/\n|,/))
        .map((keyword) => keyword.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function cloneProfiles(profiles) {
  return profiles.map((profile) => ({
    ...profile,
    primaryKeywords: [...profile.primaryKeywords],
    supportingKeywords: [...profile.supportingKeywords],
    locationKeywords: [...profile.locationKeywords],
    hiringKeywords: [...profile.hiringKeywords],
    exclusionKeywords: [...(profile.exclusionKeywords || [])]
  }));
}

function toBoundedNumber(value, fallback, minimum, maximum) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(minimum, number));
}

function hasRemovedSettings(settings) {
  return Object.keys(settings).some((key) => !(key in DEFAULT_SETTINGS));
}

function shouldResaveSettings(storedSettings, settings) {
  return hasRemovedSettings(storedSettings) ||
    JSON.stringify(storedSettings) !== JSON.stringify(settings);
}
