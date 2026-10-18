// Plans store a daily percent; admins set it as "₹ per day when investing the max amount".
export function dailyProfit(amount: number, dailyPercent: number) {
  return Math.round(((amount || 0) * (dailyPercent || 0)) / 100 * 100) / 100;
}

export function monthlyProfit(amount: number, dailyPercent: number) {
  return Math.round(dailyProfit(amount, dailyPercent) * 30 * 100) / 100;
}

export function percentFromDailyRupees(dailyRupees: number, maxAmount: number) {
  if (!maxAmount) return 0;
  return (dailyRupees / maxAmount) * 100;
}

export function dailyRupeesAtMax(dailyPercent: number, maxAmount: number) {
  return dailyProfit(maxAmount, dailyPercent);
}
