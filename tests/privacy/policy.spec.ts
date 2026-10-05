import { test, expect } from "@playwright/test";
import { formatEffectiveDate } from "../../src/lib/privacy/policy";

const savedTz = process.env.TZ;
test.beforeAll(() => {
  process.env.TZ = "America/Los_Angeles";
});
test.afterAll(() => {
  if (savedTz === undefined) delete process.env.TZ;
  else process.env.TZ = savedTz;
});

test.describe("formatEffectiveDate", () => {
  test("formats an ISO date in UTC, so the day never shifts", () => {
    expect(formatEffectiveDate("2026-10-04")).toBe("October 4, 2026");
    expect(formatEffectiveDate("2026-01-01")).toBe("January 1, 2026");
  });

  test("rejects an impossible or malformed date instead of rolling it over", () => {
    expect(formatEffectiveDate("2026-02-30")).toBeNull();
    expect(formatEffectiveDate("10/04/2026")).toBeNull();
    expect(formatEffectiveDate("")).toBeNull();
    expect(formatEffectiveDate(undefined)).toBeNull();
  });
});
