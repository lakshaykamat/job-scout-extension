import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "LinkedIn Hiring Lead Scanner",
    description: "Scans LinkedIn content search results for software hiring posts by keyword.",
    version: "0.2.0",
    action: {
      default_title: "Hiring Lead Scanner"
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
