import { describe, it, expect } from "vitest";
import { extractHeading, extractImgAlt } from "../epub-parser";

describe("extractHeading", () => {
  it("pulls text from the first h1–h3", () => {
    expect(extractHeading("<h1>Chapter One</h1>")).toBe("Chapter One");
    expect(extractHeading("<p>x</p><h2>The Second Part</h2>")).toBe(
      "The Second Part"
    );
  });

  it("strips inner tags and collapses whitespace", () => {
    expect(extractHeading('<h2 class="c">The <em>Big</em>\n  Day</h2>')).toBe(
      "The Big Day"
    );
  });

  it("returns null when there is no heading or it is empty", () => {
    expect(extractHeading("<p>just a paragraph</p>")).toBeNull();
    expect(extractHeading("<h1></h1>")).toBeNull();
  });
});

describe("extractImgAlt", () => {
  it("returns the alt text of the first image that has one", () => {
    expect(extractImgAlt('<img src="cover.jpg" alt="Cover Art" />')).toBe(
      "Cover Art"
    );
  });

  it("returns null when there is no usable alt attribute", () => {
    expect(extractImgAlt('<img src="cover.jpg" />')).toBeNull();
    expect(extractImgAlt('<img src="cover.jpg" alt="" />')).toBeNull();
  });
});
