import { downloadFile, toCsvCell } from "../../../../shared/download.js";
import { formatDate } from "../../../../shared/format.js";

export function exportCsv(posts) {
  const rows = posts.map((post) => [
    post.author || "",
    post.authorHeadline || "",
    post.authorProfileUrl || "",
    post.connectionDegree || "",
    post.timestamp || "",
    formatDate(post.foundAt),
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
      "extracted_at",
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

  downloadFile("saved-linkedin-posts.csv", csv, "text/csv");
}
