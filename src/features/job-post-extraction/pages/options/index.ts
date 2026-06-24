import { DEFAULT_SETTINGS } from "../../config/default-profiles";
import { escapeAttribute, escapeHtml } from "../../../../shared/dom";
import { getSettings, saveSettings } from "../../storage/settings-store";

const form = document.querySelector("#settingsForm") as HTMLFormElement;
const scrollDelayInput = document.querySelector("#scrollDelayInput") as HTMLInputElement;
const profileEditor = document.querySelector("#profileEditor") as HTMLElement;
const resetButton = document.querySelector("#resetButton") as HTMLButtonElement;
const saveStatus = document.querySelector("#saveStatus") as HTMLElement;

let settings = null;

document.addEventListener("DOMContentLoaded", loadSettings);
form.addEventListener("submit", saveFormSettings);
resetButton.addEventListener("click", resetProfiles);

async function loadSettings() {
  settings = await getSettings();
  scrollDelayInput.value = settings.scrollDelayMs;
  renderProfileEditor();
}

function renderProfileEditor() {
  profileEditor.innerHTML = settings.profiles.map(renderProfileCard).join("");
}

function renderProfileCard(profile) {
  return `
    <article class="panel p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-black">${escapeHtml(profile.name)}</h2>
          <p class="text-sm text-stone-500">Comma or newline separated keywords.</p>
        </div>
        <span class="rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss">${profile.primaryKeywords.length + profile.supportingKeywords.length} keywords</span>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        ${renderKeywordTextarea(profile, "primaryKeywords", "Primary role keywords")}
        ${renderKeywordTextarea(profile, "supportingKeywords", "Supporting keywords")}
        ${renderKeywordTextarea(profile, "locationKeywords", "Location keywords")}
        ${renderKeywordTextarea(profile, "hiringKeywords", "Hiring intent keywords")}
        ${renderKeywordTextarea(profile, "exclusionKeywords", "Ignore if post contains")}
      </div>
    </article>
  `;
}

function renderKeywordTextarea(profile, field, label) {
  return `
    <label class="field-label">
      ${label}
      <textarea class="textarea-input" data-profile-id="${escapeAttribute(profile.id)}" data-field="${field}">${escapeHtml(profile[field].join("\n"))}</textarea>
    </label>
  `;
}

async function saveFormSettings(event) {
  event.preventDefault();

  await saveSettings({
    ...settings,
    scrollDelayMs: Number(scrollDelayInput.value),
    profiles: collectProfiles()
  });

  settings = await getSettings();
  renderProfileEditor();
  showSaved();
}

async function resetProfiles() {
  settings = {
    ...settings,
    activeProfileId: DEFAULT_SETTINGS.activeProfileId,
    profiles: DEFAULT_SETTINGS.profiles
  };
  await saveSettings(settings);
  settings = await getSettings();
  scrollDelayInput.value = settings.scrollDelayMs;
  renderProfileEditor();
  showSaved();
}

function collectProfiles() {
  return settings.profiles.map((profile) => ({
    ...profile,
    primaryKeywords: getKeywords(profile.id, "primaryKeywords"),
    supportingKeywords: getKeywords(profile.id, "supportingKeywords"),
    locationKeywords: getKeywords(profile.id, "locationKeywords"),
    hiringKeywords: getKeywords(profile.id, "hiringKeywords"),
    exclusionKeywords: getKeywords(profile.id, "exclusionKeywords")
  }));
}

function getKeywords(profileId, field) {
  const selector = `[data-profile-id="${cssEscape(profileId)}"][data-field="${field}"]`;
  const textarea = profileEditor.querySelector(selector) as HTMLTextAreaElement | null;
  return String(textarea?.value || "")
    .split(/\n|,/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function showSaved() {
  saveStatus.textContent = "Saved.";
  window.setTimeout(() => {
    saveStatus.textContent = "";
  }, 1800);
}

function cssEscape(value) {
  return String(value || "").replaceAll("\\", "\\\\").replaceAll("\"", "\\\"");
}
