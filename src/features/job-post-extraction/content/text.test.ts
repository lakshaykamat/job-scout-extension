import { describe, expect, it } from "vitest";
import {
  cleanMultilineText,
  getUsefulLines,
  normalizeComparableText,
  normalizeText,
  toNumber
} from "./text";

describe("content text helpers", () => {
  it("normalizes whitespace", () => {
    expect(normalizeText("  Hiring\n\n  now\tfor React  ")).toBe("Hiring now for React");
  });

  it("keeps meaningful multiline content", () => {
    expect(cleanMultilineText(" First line \n\n Second\tline ")).toBe("First line\nSecond line");
    expect(getUsefulLines(" A \n\n B ")).toEqual(["A", "B"]);
  });

  it("removes LinkedIn action text from comparable text", () => {
    expect(normalizeComparableText("Hiring React engineers …more Like Comment")).toBe("hiring react engineers");
  });

  it("converts non-numeric values to zero", () => {
    expect(toNumber("42")).toBe(42);
    expect(toNumber("not-a-number")).toBe(0);
  });
});
