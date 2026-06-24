import { describe, expect, it } from "vitest";
import { getMatchingPosts } from "./post-filter";

const profile = {
  id: "frontend",
  name: "Frontend",
  primaryKeywords: ["frontend engineer"],
  supportingKeywords: ["react"],
  locationKeywords: ["remote"],
  hiringKeywords: ["hiring"],
  exclusionKeywords: ["agency"]
};

function createPost(overrides = {}) {
  return {
    id: "post-1",
    text: "",
    rawText: "",
    author: "",
    authorHeadline: "",
    hashtags: [],
    ...overrides
  };
}

describe("getMatchingPosts", () => {
  it("keeps posts that match profile keywords", () => {
    const posts = [
      createPost({ id: "match", text: "We are hiring a frontend engineer for a remote team." }),
      createPost({ id: "miss", text: "General career advice for candidates." })
    ];

    expect(getMatchingPosts(posts, profile).map((post) => post.id)).toEqual(["match"]);
  });

  it("removes posts with excluded keywords even when they otherwise match", () => {
    const posts = [
      createPost({ id: "excluded", text: "Agency hiring frontend engineer for React work." }),
      createPost({ id: "allowed", text: "Startup hiring React developer." })
    ];

    expect(getMatchingPosts(posts, profile).map((post) => post.id)).toEqual(["allowed"]);
  });
});
