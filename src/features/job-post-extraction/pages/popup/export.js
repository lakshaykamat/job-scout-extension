import { downloadFile, toCsvCell } from "../../../../shared/download.js";

export function exportJson(scanData) {
  downloadFile("linkedin-hiring-posts.json", JSON.stringify(scanData, null, 2), "application/json");
}

export function exportCsv(scanData) {
  const rows = scanData.posts.map((post) => [
    post.author || "",
    post.authorHeadline || "",
    post.authorProfileUrl || "",
    post.connectionDegree || "",
    post.timestamp || "",
    (post.hashtags || []).join(" "),
    (post.externalLinks || []).map((link) => link.resolvedUrl || link.url).join(" | "),
    post.preview?.title || "",
    post.preview?.resolvedUrl || "",
    post.engagement?.reactions || 0,
    post.engagement?.comments || 0,
    post.engagement?.reposts || 0,
    post.text || "",
    post.rawText || "",
    post.url || ""
  ]);

  const csv = [
    [
      "author",
      "author_headline",
      "author_profile_url",
      "connection_degree",
      "timestamp",
      "hashtags",
      "external_links",
      "preview_title",
      "preview_url",
      "reactions",
      "comments",
      "reposts",
      "post_text",
      "raw_text",
      "url"
    ],
    ...rows
  ].map((row) => row.map(toCsvCell).join(",")).join("\n");

  downloadFile("linkedin-hiring-posts.csv", csv, "text/csv");
}
