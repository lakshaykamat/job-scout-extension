import { defineContentScript } from "wxt/utils/define-content-script";
import { initializeLinkedInContentScanner } from "../src/features/job-post-extraction/content";

export default defineContentScript({
  matches: ["https://www.linkedin.com/search/results/content/*"],
  runAt: "document_idle",
  main() {
    initializeLinkedInContentScanner();
  }
});
