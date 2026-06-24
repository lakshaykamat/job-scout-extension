declare global {
  // Existing LinkedIn content modules share one scanner namespace.
  // Keep this broad during the WXT migration to avoid changing scan behavior.
  // eslint-disable-next-line no-var
  var LinkedInHiringScanner: any;
}

export {};
