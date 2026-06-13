'use server'

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

interface SearchFilters {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  minCapacity?: number
  amenities?: string[]
  startDate?: Date
  endDate?: Date
  vendorId?: string
  sort?: string
  rating?: number
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
  const current = normalizeDate(start)
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
      endDate,
      vendorId,
      sort,
      rating
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
    const whereConditions: Prisma.ProductWhereInput = {
      isRentable: true,
      isApproved: true, // Only search approved halls
    }

    // Filter out unavailable halls and/or match search query
    if (unavailableProductIds.length > 0 || query) {
      const idFilter: Prisma.StringFilter = {}
      if (unavailableProductIds.length > 0) {
        idFilter.notIn = unavailableProductIds
      }
      if (query) {
        // Execute raw query for pg_trgm similarity matching
        const matchingProducts = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "Product"
          WHERE similarity(name, ${query}) > 0.25
             OR similarity(description, ${query}) > 0.25
             OR name ILIKE ${`%${query}%`}
             OR description ILIKE ${`%${query}%`}
             OR city ILIKE ${`%${query}%`}
             OR address ILIKE ${`%${query}%`}
        `
        const trigramProductIds = matchingProducts.map((p) => p.id)

        if (trigramProductIds.length === 0) {
          // If search query is provided but returns zero matches, return early with empty array
          return { success: true, data: [] }
        }
        idFilter.in = trigramProductIds
      }
      whereConditions.id = idFilter
    }

    // Vendor Filter
    if (vendorId) {
      whereConditions.vendorId = vendorId
    }

    // Category Filter
    if (categoryId) {
      whereConditions.categoryId = categoryId
    }

    // Price Filtering (daily rental rate)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: Prisma.FloatFilter = {}
      if (minPrice !== undefined) {
        priceFilter.gte = minPrice
      }
      if (maxPrice !== undefined) {
        priceFilter.lte = maxPrice
      }
      whereConditions.priceDaily = priceFilter
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

    // 3. Determine Sorting Order
    let orderByCondition: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'price_asc') {
      orderByCondition = { priceDaily: 'asc' }
    } else if (sort === 'price_desc') {
      orderByCondition = { priceDaily: 'desc' }
    }

    // 4. Execute query with relations
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
      orderBy: orderByCondition
    })

    // 5. Map average rating fields
    let mappedHalls = halls.map(hall => {
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

    // 6. Filter by rating in-memory
    if (rating !== undefined && rating > 0) {
      mappedHalls = mappedHalls.filter(hall => hall.avgRating >= rating)
    }

    // 7. Sort by rating in-memory if specified
    if (sort === 'rating_desc') {
      mappedHalls.sort((a, b) => b.avgRating - a.avgRating)
    }

    return { success: true, data: mappedHalls }

  } catch (error) {
    console.error("Hall Search Failed:", error instanceof Error ? error.message : error)
    return { success: false, message: (error instanceof Error ? error.message : "") || "Failed to search halls." }
  }
}
