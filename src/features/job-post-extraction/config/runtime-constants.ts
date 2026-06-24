export const STORAGE_KEYS = {
  settings: "settings",
  currentScanId: "currentScanId",
  scans: "scans",
  postsByScan: "postsByScan"
};

export const MESSAGE_TYPES = {
  startScan: "START_SCAN",
  stopScan: "STOP_SCAN",
  getScanState: "GET_SCAN_STATE",
  scanBatch: "SCAN_BATCH",
  scanProgress: "SCAN_PROGRESS",
  scanFinished: "SCAN_FINISHED",
  scanFailed: "SCAN_FAILED",
  scanUpdated: "SCAN_UPDATED"
};

export const SCAN_STATUS = {
  running: "running",
  stopped: "stopped",
  complete: "complete",
  error: "error"
};

export const LINKEDIN_CONTENT_SEARCH_PATTERN = /^https:\/\/www\.linkedin\.com\/search\/results\/content\//;
