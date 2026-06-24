import { defineBackground } from "wxt/utils/define-background";
import { initializeBackground } from "../src/features/job-post-extraction/background";

export default defineBackground(() => {
  initializeBackground();
});
