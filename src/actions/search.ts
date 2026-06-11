'use server'

import { prisma } from "@/lib/prisma"

interface SearchFilters {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  minCapacity?: number
  amenities?: string[]
  startDate?: Date
  endDate?: Date
}

/**
 * Normalizes a date to UTC midnight.
 */
function normalizeDate(date: Date): Date {
  const d = new Date(date)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Generates dates between start and end (inclusive).
 */
function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  let current = normalizeDate(start)
  const last = normalizeDate(end)

  while (current <= last) {
    dates.push(new Date(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }
  return dates
}

/**
 * Performs fuzzy searching and multi-attribute filtering on halls (products)
 */
export async function searchHalls(filters: SearchFilters) {
  try {
    const {
      query,
      categoryId,
      minPrice,
      maxPrice,
      minCapacity,
      amenities,
      startDate,
      endDate
    } = filters

    // 1. Identify product IDs that are unavailable during the selected date range
    let unavailableProductIds: string[] = []
    
    if (startDate && endDate) {
      const datesToCheck = getDatesInRange(startDate, endDate)
      
      const blockedRecords = await prisma.hallAvailability.findMany({
        where: {
          bookingDate: {
            in: datesToCheck
          },
          status: "BLOCKED"
        },
        select: {
          productId: true
        }
      })

      // Extract unique product IDs
      unavailableProductIds = Array.from(new Set(blockedRecords.map((r) => r.productId)))
    }

    // 2. Build Prisma dynamic query filter
    const whereConditions: any = {
      isRentable: true,
      isApproved: true, // Only search approved halls
    }

    // Filter out unavailable halls
    if (unavailableProductIds.length > 0) {
      whereConditions.id = {
        notIn: unavailableProductIds
      }
    }

    // Fuzzy query match across Name, Description, City, Address
    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Category Filter
    if (categoryId) {
      whereConditions.categoryId = categoryId
    }

    // Price Filtering (daily rental rate)
    if (minPrice !== undefined || maxPrice !== undefined) {
      whereConditions.priceDaily = {}
      if (minPrice !== undefined) {
        whereConditions.priceDaily.gte = minPrice
      }
      if (maxPrice !== undefined) {
        whereConditions.priceDaily.lte = maxPrice
      }
    }

    // Capacity Filtering (Max Guests)
    if (minCapacity !== undefined) {
      whereConditions.capacity = {
        gte: minCapacity
      }
    }

    // Amenities Filtering (check if the product contains all specified amenities)
    if (amenities && amenities.length > 0) {
      whereConditions.amenities = {
        hasEvery: amenities
      }
    }

    // 3. Execute query with relations
    const halls = await prisma.product.findMany({
      where: whereConditions,
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 4. Map average rating fields
    const mappedHalls = halls.map(hall => {
      const totalReviews = hall.reviews.length
      const avgRating = totalReviews > 0
        ? hall.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0
      
      return {
        ...hall,
        avgRating,
        totalReviews
      }
    })

    return { success: true, data: mappedHalls }

  } catch (error: any) {
    console.error("Hall Search Failed:", error.message)
    return { success: false, message: error.message || "Failed to search halls." }
  }
}
