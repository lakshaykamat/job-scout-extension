import { defineConfig } from "wxt";
import { readFileSync } from "node:fs";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8")
);

const extensionDescription = "Find, save, and export job opportunities from LinkedIn content search results.";

export default defineConfig({
  manifest: {
    name: "Job Scout Extension",
    description: extensionDescription,
    version: packageJson.version,
    icons: {
      16: "icons/icon-16.png",
      32: "icons/icon-32.png",
      48: "icons/icon-48.png",
      96: "icons/icon-96.png",
      128: "icons/icon-128.png"
    },
    action: {
      default_title: "Job Scout",
      default_icon: {
        16: "icons/icon-16.png",
        32: "icons/icon-32.png",
        48: "icons/icon-48.png",
        96: "icons/icon-96.png",
        128: "icons/icon-128.png"
      }
    },
    browser_specific_settings: {
      gecko: {
        id: "job-scout-extension@example.com",
        data_collection_permissions: {
          required: ["none"]
        }
      }
    },
    permissions: [
      "activeTab",
      "storage",
      "tabs",
      "unlimitedStorage"
    ],
    host_permissions: [
      "https://www.linkedin.com/*"
    ]
  }
});
