import { describe, it, expect } from "vitest";
import { formatTokens, formatCost } from "../format";

describe("formatTokens", () => {
  it("shows small counts verbatim", () => {
    expect(formatTokens(0)).toBe("0");
    expect(formatTokens(999)).toBe("999");
  });

  it("compacts thousands and trims trailing .0", () => {
    expect(formatTokens(1000)).toBe("1k");
    expect(formatTokens(1234)).toBe("1.2k");
    expect(formatTokens(20000)).toBe("20k");
  });
});

describe("formatCost", () => {
  it("renders zero and free as $0", () => {
    expect(formatCost(0)).toBe("$0");
  });

  it("avoids rounding tiny nonzero costs to $0.0000", () => {
    expect(formatCost(0.00002)).toBe("<$0.0001");
  });

  it("uses 4 decimals under $1 and 2 decimals at/above $1", () => {
    expect(formatCost(0.0123)).toBe("$0.0123");
    expect(formatCost(2.5)).toBe("$2.50");
  });
});
