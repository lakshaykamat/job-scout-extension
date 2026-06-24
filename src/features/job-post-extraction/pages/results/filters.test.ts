import { describe, expect, it } from "vitest";
import { getVisiblePosts } from "./filters";

function createPost(overrides = {}) {
  return {
    id: "post-1",
    text: "",
    rawText: "",
    author: "",
    authorHeadline: "",
    authorProfileUrl: "",
    connectionDegree: "",
    timestamp: "",
    foundAt: Date.parse("2026-06-24T10:00:00Z"),
    url: "",
    hashtags: [],
    links: [],
    preview: null,
    ...overrides
  };
}

describe("getVisiblePosts", () => {
  it("filters posts by text query", () => {
    const posts = [
      createPost({ id: "react", text: "Hiring React engineers" }),
      createPost({ id: "backend", text: "Hiring backend engineers" })
    ];

    const visible = getVisiblePosts(posts, {
      query: "react",
      extractedFrom: "",
      extractedTo: ""
    });

    expect(visible.map((post) => post.id)).toEqual(["react"]);
  });

  it("filters posts by extracted date range and sorts newest first", () => {
    const posts = [
      createPost({ id: "old", foundAt: Date.parse("2026-06-20T10:00:00Z") }),
      createPost({ id: "new", foundAt: Date.parse("2026-06-24T10:00:00Z") })
    ];

    const visible = getVisiblePosts(posts, {
      query: "",
      extractedFrom: "2026-06-21T00:00",
      extractedTo: "2026-06-24T23:59"
    });

    expect(visible.map((post) => post.id)).toEqual(["new"]);
  });
});
