import { stripAnchorsAndParamsFromURLString } from "../src/lib/stripLinks";

describe("stripAnchorsAndParamsFromURLString", () => {
  it("should remove anchors and parameters from a URL string", () => {
    const url = "https://example.com/page?param=value#anchor";
    const expected = "https://example.com/page";
    const result = stripAnchorsAndParamsFromURLString(url);
    expect(result).toBe(expected);

    const url2 = "https://example.com/page#anchor";
    const expected2 = "https://example.com/page";
    const result2 = stripAnchorsAndParamsFromURLString(url2);
    expect(result2).toBe(expected2);
  });

  it("should return the same string if there are no anchors or parameters", () => {
    const url = "https://example.com/page";
    const expected = "https://example.com/page";
    const result = stripAnchorsAndParamsFromURLString(url);
    expect(result).toBe(expected);
  });
});
