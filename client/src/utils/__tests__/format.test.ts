import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatDuration,
  truncateText,
} from "../format";

describe("formatCurrency", () => {
  it("formats USD currency correctly", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });

  it("formats different currencies", () => {
    expect(formatCurrency(1234.56, "EUR")).toBe("€1,234.56");
    expect(formatCurrency(1234.56, "GBP")).toBe("£1,234.56");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-1234.56)).toBe("-$1,234.56");
  });
});

describe("formatDate", () => {
  it("formats date string correctly", () => {
    const dateString = "2024-01-15T10:30:00Z";
    const formatted = formatDate(dateString);
    expect(formatted).toMatch(/January 15, 2024/);
  });

  it("formats Date object correctly", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const formatted = formatDate(date);
    expect(formatted).toMatch(/January 15, 2024/);
  });

  it("handles different date formats", () => {
    const date = new Date("2024-12-25");
    const formatted = formatDate(date);
    expect(formatted).toMatch(/December 25, 2024/);
  });
});

describe("formatDuration", () => {
  it("formats minutes only", () => {
    expect(formatDuration(30)).toBe("30m");
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats hours only", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(180)).toBe("3h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
    expect(formatDuration(125)).toBe("2h 5m");
    expect(formatDuration(145)).toBe("2h 25m");
  });

  it("handles zero duration", () => {
    expect(formatDuration(0)).toBe("0m");
  });
});

describe("truncateText", () => {
  it("returns original text if shorter than max length", () => {
    expect(truncateText("Hello", 10)).toBe("Hello");
    expect(truncateText("Short", 5)).toBe("Short");
  });

  it("truncates text longer than max length", () => {
    expect(truncateText("Hello World", 5)).toBe("Hello...");
    expect(truncateText("This is a long text", 10)).toBe("This is a ...");
  });

  it("handles exact length", () => {
    expect(truncateText("Hello", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncateText("", 10)).toBe("");
  });

  it("handles zero max length", () => {
    expect(truncateText("Hello", 0)).toBe("...");
  });
});
