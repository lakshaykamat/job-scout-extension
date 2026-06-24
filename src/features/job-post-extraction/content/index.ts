import "./globals";
import "./text";
import "./dom";
import "./links";
import "./author";
import "./post-finder";
import "./post-extractor";
import "./scroll";
import "./scanner";

export function initializeLinkedInContentScanner() {
  const scanner = globalThis.LinkedInHiringScanner;
  const { MESSAGE_TYPES } = scanner;

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === MESSAGE_TYPES.startScan) {
      scanner.startScan(message).catch((error) => {
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.scanFailed,
          scanId: message.scanId,
          error: error.message
        });
      });
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === MESSAGE_TYPES.stopScan) {
      scanner.stopScan();
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === MESSAGE_TYPES.getScanState) {
      sendResponse({
        ok: true,
        ...scanner.getScanState()
      });
      return true;
    }

    return false;
  });
}
