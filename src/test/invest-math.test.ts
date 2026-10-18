import { describe, expect, it } from "vitest";
import { dailyProfit, monthlyProfit, percentFromDailyRupees, dailyRupeesAtMax } from "@/lib/invest-math";

describe("Invest profit set by admin", () => {
  it("₹100 per day on a ₹500 max plan pays ₹100 daily for ₹500", () => {
    const pct = percentFromDailyRupees(100, 500);
    expect(dailyProfit(500, pct)).toBe(100);
  });
  it("monthly profit is 30 days of daily profit", () => {
    expect(monthlyProfit(500, percentFromDailyRupees(100, 500))).toBe(3000);
  });
  it("smaller amounts earn proportionally", () => {
    expect(dailyProfit(250, percentFromDailyRupees(100, 500))).toBe(50);
  });
  it("admin form shows the same daily rupees it saved", () => {
    expect(dailyRupeesAtMax(percentFromDailyRupees(100, 500), 500)).toBe(100);
  });
});
