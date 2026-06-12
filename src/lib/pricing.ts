/**
 * Dynamic Pricing Utility for Hall Rental SaaS Platform
 * Enforces peak weekend pricing (20% surcharge on Saturdays and Sundays).
 */

interface PricingBreakdown {
  total: number;
  baseTotal: number;
  weekendSurcharge: number;
  weekdayCount: number;
  weekendCount: number;
  totalDays: number;
}

/**
 * Normalizes a date to UTC midnight.
 */
function normalizeDate(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculates the dynamically adjusted rental price based on weekdays and weekends.
 * Saturdays (Day 6) and Sundays (Day 0) attract a 20% peak weekend premium.
 */
export function calculateHallRent(baseRateDaily: number, start: Date, end: Date): PricingBreakdown {
  const normalizedStart = normalizeDate(start);
  const normalizedEnd = normalizeDate(end);

  let weekdayCount = 0;
  let weekendCount = 0;
  let totalDays = 0;
  let total = 0;

  const current = new Date(normalizedStart);
  while (current <= normalizedEnd) {
    totalDays++;
    const dayOfWeek = current.getUTCDay(); // 0 is Sunday, 6 is Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCount++;
      total += baseRateDaily * 1.20; // 20% surcharge on weekends
    } else {
      weekdayCount++;
      total += baseRateDaily; // Normal rate on weekdays
    }

    current.setUTCDate(current.getUTCDate() + 1);
  }

  const baseTotal = baseRateDaily * totalDays;
  const weekendSurcharge = Math.max(0, total - baseTotal);

  return {
    total: Math.round(total),
    baseTotal: Math.round(baseTotal),
    weekendSurcharge: Math.round(weekendSurcharge),
    weekdayCount,
    weekendCount,
    totalDays
  };
}
