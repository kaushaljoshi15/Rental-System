'use server'

import { prisma, prismaRetry } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { openai } from "@/lib/openai"

const fetchProductsCached = unstable_cache(
  async (whereStr: string, orderStr: string) => {
    const where = JSON.parse(whereStr)
    const orderBy = JSON.parse(orderStr)
    return await prismaRetry(() => prisma.product.findMany({
      where,
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
      orderBy
    }))
  },
  ["products-list-cache"],
  { revalidate: 15, tags: ["products"] }
)

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

const SYNONYMS: Record<string, string[]> = {
  "cloth": ["fashion", "wear", "suit", "dress", "clothing", "saree", "shirt", "garment"],
  "clothes": ["fashion", "wear", "suit", "dress", "clothing", "saree", "shirt", "garment"],
  "clothing": ["fashion", "wear", "suit", "dress", "saree", "shirt", "garment"],
  "camera": ["dslr", "mirrorless", "lens", "shoot", "video", "photo", "photography", "drone"],
  "video": ["camera", "dslr", "mirrorless", "lens", "shoot", "drone", "gimbal"],
  "audio": ["speaker", "sound", "music", "mic", "microphone", "mixer", "pa-system"],
  "sound": ["audio", "speaker", "music", "mic", "microphone", "mixer", "pa-system"],
  "music": ["audio", "speaker", "sound", "mic", "microphone", "mixer", "pa-system"],
  "speaker": ["audio", "sound", "music", "pa-system"],
  "microphone": ["audio", "sound", "music", "mic"],
  "mic": ["audio", "sound", "music", "microphone"],
  "furniture": ["chair", "desk", "table", "sofa", "bean-bag", "office"],
  "chair": ["furniture", "sofa", "office"],
  "table": ["furniture", "desk"],
  "desk": ["furniture", "table", "standing-desk"],
  "tent": ["camping", "canopy", "outdoor", "sleeping-bag", "grill"],
  "camping": ["tent", "canopy", "outdoor", "sleeping-bag", "grill"],
  "gaming": ["console", "ps5", "xbox", "vr", "monitor", "laptop"],
  "laptop": ["gaming", "computer", "tablet", "monitor"],
  "hall": ["event-infrastructure", "event infrastructure", "banquet halls", "banquet hall", "halls", "infrastructure", "venue", "space"],
  "halls": ["event-infrastructure", "event infrastructure", "banquet halls", "banquet hall", "hall", "infrastructure", "venue", "space"],
  "banquet": ["event-infrastructure", "event infrastructure", "banquet halls", "banquet hall", "hall", "halls", "venue", "space"]
};

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
      OR: [
        { vendorId: null },
        { vendor: { isVerifiedVendor: true } }
      ]
    }

    // Filter out unavailable halls and/or match search query
    if (unavailableProductIds.length > 0 || query) {
      const idFilter: Prisma.StringFilter = {}
      if (unavailableProductIds.length > 0) {
        idFilter.notIn = unavailableProductIds
      }
      if (query) {
        // Define helper to execute query raw search with joined categories & unnested amenities
        const executeSearchQuery = async (searchTerm: string): Promise<{ id: string }[]> => {
          try {
            return await prismaRetry(() => prisma.$queryRaw<{ id: string }[]>`
              SELECT DISTINCT p.id FROM "Product" p
              LEFT JOIN "Category" c ON p."categoryId" = c.id
              WHERE similarity(p.name, ${searchTerm}) > 0.12
                 OR similarity(p.description, ${searchTerm}) > 0.12
                 OR similarity(c.name, ${searchTerm}) > 0.12
                 OR similarity(c.slug, ${searchTerm}) > 0.12
                 OR p.name ILIKE ${`%${searchTerm}%`}
                 OR p.description ILIKE ${`%${searchTerm}%`}
                 OR c.name ILIKE ${`%${searchTerm}%`}
                 OR c.slug ILIKE ${`%${searchTerm}%`}
                 OR p.city ILIKE ${`%${searchTerm}%`}
                 OR p.address ILIKE ${`%${searchTerm}%`}
                 OR EXISTS (
                   SELECT 1 FROM unnest(p.amenities) a 
                   WHERE a ILIKE ${`%${searchTerm}%`}
                      OR similarity(a, ${searchTerm}) > 0.12
                 )
            `)
          } catch (e) {
            // Fallback to standard ILIKE search if pg_trgm is not enabled
            return await prismaRetry(() => prisma.$queryRaw<{ id: string }[]>`
              SELECT DISTINCT p.id FROM "Product" p
              LEFT JOIN "Category" c ON p."categoryId" = c.id
              WHERE p.name ILIKE ${`%${searchTerm}%`}
                 OR p.description ILIKE ${`%${searchTerm}%`}
                 OR c.name ILIKE ${`%${searchTerm}%`}
                 OR c.slug ILIKE ${`%${searchTerm}%`}
                 OR p.city ILIKE ${`%${searchTerm}%`}
                 OR p.address ILIKE ${`%${searchTerm}%`}
                 OR EXISTS (
                   SELECT 1 FROM unnest(p.amenities) a 
                   WHERE a ILIKE ${`%${searchTerm}%`}
                 )
            `)
          }
        }

        // Expand search term using the synonyms dictionary
        const searchTerms = [query.trim().toLowerCase()];
        const matchingSynonyms = SYNONYMS[query.trim().toLowerCase()];
        if (matchingSynonyms) {
          searchTerms.push(...matchingSynonyms);
        }

        // Fetch matching products for all query terms (including synonyms) in parallel
        const queryResults = await Promise.all(searchTerms.map(term => executeSearchQuery(term)));
        
        // Deduplicate IDs
        const seenIds = new Set<string>();
        for (const res of queryResults) {
          for (const item of res) {
            seenIds.add(item.id);
          }
        }

        // Multi-word fallback: if no results and search phrase contains spaces, split and search parts
        if (seenIds.size === 0 && query.trim().includes(" ")) {
          const splitTerms = query.split(/\s+/).filter(t => t.toLowerCase() !== "and" && t.toLowerCase() !== "the" && t.toLowerCase() !== "for" && t.length > 2);
          if (splitTerms.length > 0) {
            const splitResults = await Promise.all(splitTerms.map(term => executeSearchQuery(term)));
            for (const res of splitResults) {
              for (const item of res) {
                seenIds.add(item.id);
              }
            }
          }
        }

        const trigramProductIds = Array.from(seenIds);

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
    const halls = await fetchProductsCached(
      JSON.stringify(whereConditions),
      JSON.stringify(orderByCondition)
    )

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

/**
 * AI-powered semantic search using OpenAI text embeddings and pgvector cosine similarity.
 * Automatically falls back to high-performance fuzzy trigram search if keys or tables are missing.
 */
export async function searchHallsSemantic(query: string) {
  if (!query || query.trim() === "") {
    return { success: true, data: [] }
  }

  // 1. Fallback if OpenAI client is not initialized
  if (!openai) {
    console.log("⚠️ OpenAI key missing, falling back to standard text-fuzzy search.");
    return await searchHalls({ query });
  }

  try {
    // 2. Fetch Query Embeddings from OpenAI
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
    });
    const embedding = response.data[0].embedding;

    // 3. Query PostgreSQL using pgvector cosine distance similarity (<=>)
    try {
      const dbQueryRes = await prisma.$queryRaw<any[]>`
        SELECT id FROM "Product"
        WHERE "isRentable" = true AND "isApproved" = true
        ORDER BY embedding <=> ${embedding}::vector
        LIMIT 12
      `;

      if (dbQueryRes.length === 0) {
        return { success: true, data: [] };
      }

      const matchIds = dbQueryRes.map(item => item.id);
      
      // Fetch full product objects matching those IDs
      const halls = await prisma.product.findMany({
        where: {
          id: { in: matchIds }
        },
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
        }
      });

      // Map average rating in-memory
      const mappedHalls = halls.map(hall => {
        const totalReviews = hall.reviews.length;
        const avgRating = totalReviews > 0
          ? hall.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
          : 0;
        return {
          ...hall,
          avgRating,
          totalReviews
        };
      });

      // Sort mappedHalls to preserve the pgvector distance order
      const sortedHalls = mappedHalls.sort((a, b) => matchIds.indexOf(a.id) - matchIds.indexOf(b.id));

      return { success: true, data: sortedHalls };
    } catch (dbError) {
      console.warn("⚠️ pgvector query failed (embedding column likely missing). Falling back to fuzzy search. Error:", dbError);
      return await searchHalls({ query });
    }
  } catch (error) {
    console.error("Semantic search failed, falling back to standard text-fuzzy search. Error:", error);
    return await searchHalls({ query });
  }
}
