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
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Calculates the dynamically adjusted rental price based on weekdays and weekends.
 * Saturdays (Day 6) and Sundays (Day 0) attract a 20% peak weekend premium.
 */
export function calculateHallRent(baseRateDaily: number, start: Date, end: Date): PricingBreakdown {
  const normalizedStart = normalizeDate(start);
  const normalizedEnd = normalizeDate(end);

  const diffTime = normalizedEnd.getTime() - normalizedStart.getTime();
  const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let weekdayCount = 0;
  let weekendCount = 0;
  let total = 0;

  const current = new Date(normalizedStart);
  for (let i = 0; i < totalDays; i++) {
    const dayOfWeek = current.getDay(); // 0 is Sunday, 6 is Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCount++;
      total += baseRateDaily * 1.20; // 20% surcharge on weekends
    } else {
      weekdayCount++;
      total += baseRateDaily; // Normal rate on weekdays
    }

    current.setDate(current.getDate() + 1);
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

export interface PayoutOrderLine {
  price: number;
  quantity: number;
  product: {
    vendorId: string | null;
    vendor?: {
      commissionRate: number;
    } | null;
  };
}

export interface PayoutOrder {
  startDate: Date | string;
  endDate: Date | string;
  discountAmount: number | null;
  lines: PayoutOrderLine[];
}

/**
 * Calculates correct revenue figures for a specific vendor on a given order,
 * accounting for weekend surcharges, coupon discounts, and custom commission rates.
 */
export function calculateVendorRevenueForOrder(order: PayoutOrder, vendorId: string) {
  let dynamicOrderTotal = 0;
  let vendorCutRaw = 0;
  let platformCutRaw = 0;
  let vendorGrossRaw = 0;

  const start = new Date(order.startDate);
  const end = new Date(order.endDate);
  const discountAmount = order.discountAmount ?? 0;

  for (const line of order.lines) {
    const lineVendorId = line.product.vendorId;
    const commissionRate = line.product.vendor?.commissionRate ?? 10.0;

    // Calculate dynamic pricing based on dates
    const pricingBreakdown = calculateHallRent(line.price, start, end);
    const lineTotal = pricingBreakdown.total * line.quantity;
    dynamicOrderTotal += lineTotal;

    if (lineVendorId === vendorId) {
      vendorGrossRaw += lineTotal;
      const platformCut = lineTotal * (commissionRate / 100);
      const vendorCut = lineTotal - platformCut;
      vendorCutRaw += vendorCut;
      platformCutRaw += platformCut;
    }
  }

  const discountRatio = dynamicOrderTotal > 0 ? Math.max(0, dynamicOrderTotal - discountAmount) / dynamicOrderTotal : 0;

  const vendorPayout = Math.round(vendorCutRaw * discountRatio * 100) / 100;
  const platformFee = Math.round(platformCutRaw * discountRatio * 100) / 100;
  const grossAmount = Math.round(vendorGrossRaw * discountRatio * 100) / 100;

  return {
    grossAmount,
    platformFee,
    vendorPayout
  };
}

