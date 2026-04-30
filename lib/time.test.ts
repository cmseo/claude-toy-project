import { describe, expect, it } from "vitest";
import { formatDuration } from "./time";

describe("formatDuration", () => {
  it("90 → '1시간 30분'", () => {
    expect(formatDuration(90)).toBe("1시간 30분");
  });

  it("60 → '1시간'", () => {
    expect(formatDuration(60)).toBe("1시간");
  });

  it("30 → '30분'", () => {
    expect(formatDuration(30)).toBe("30분");
  });

  it("0 → '0분'", () => {
    expect(formatDuration(0)).toBe("0분");
  });

  it("125 → '2시간 5분'", () => {
    expect(formatDuration(125)).toBe("2시간 5분");
  });
});
