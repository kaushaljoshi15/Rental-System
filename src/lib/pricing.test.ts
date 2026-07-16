import { describe, it, expect } from 'vitest'
import { calculateHallRent, calculateVendorRevenueForOrder } from './pricing'

describe('calculateHallRent', () => {
  it('calculates weekday rate with no surcharge', () => {
    // Monday to Wednesday (3 days)
    const start = new Date('2026-07-13T00:00:00Z') // Monday
    const end = new Date('2026-07-15T00:00:00Z') // Wednesday
    const rate = 1000

    const result = calculateHallRent(rate, start, end)

    expect(result.totalDays).toBe(3)
    expect(result.weekdayCount).toBe(3)
    expect(result.weekendCount).toBe(0)
    expect(result.baseTotal).toBe(3000)
    expect(result.weekendSurcharge).toBe(0)
    expect(result.total).toBe(3000)
  })

  it('applies 20% surcharge on Saturdays and Sundays', () => {
    // Friday to Sunday (3 days: Friday = weekday, Sat/Sun = weekends)
    const start = new Date('2026-07-17T00:00:00Z') // Friday
    const end = new Date('2026-07-19T00:00:00Z') // Sunday
    const rate = 1000

    const result = calculateHallRent(rate, start, end)

    expect(result.totalDays).toBe(3)
    expect(result.weekdayCount).toBe(1)
    expect(result.weekendCount).toBe(2)
    expect(result.baseTotal).toBe(3000)
    // 1 weekday ($1000) + 2 weekends ($1200 * 2) = $3400
    expect(result.weekendSurcharge).toBe(400)
    expect(result.total).toBe(3400)
  })
})

describe('calculateVendorRevenueForOrder', () => {
  it('correctly calculates splits with custom commission', () => {
    const order = {
      startDate: new Date('2026-07-13T00:00:00Z'), // Monday
      endDate: new Date('2026-07-14T00:00:00Z'), // Tuesday
      discountAmount: 200, // discount
      lines: [
        {
          price: 1000,
          quantity: 1,
          product: {
            vendorId: 'vendor-1',
            vendor: {
              commissionRate: 15.0 // 15% commission
            }
          }
        }
      ]
    }

    // 2 weekdays base rate = $2000 total.
    // Platform fee raw: 15% of $2000 = $300.
    // Vendor cut raw: $1700.
    // Discount ratio: (2000 - 200) / 2000 = 0.9.
    // Vendor payout final: $1700 * 0.9 = $1530.
    // Platform fee final: $300 * 0.9 = $270.
    const result = calculateVendorRevenueForOrder(order, 'vendor-1')

    expect(result.grossAmount).toBe(1800) // $2000 * 0.9
    expect(result.vendorPayout).toBe(1530)
    expect(result.platformFee).toBe(270)
  })
})
