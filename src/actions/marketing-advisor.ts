'use server'

import { prisma } from "@/lib/prisma"

interface AdviceReport {
  priceStatus: 'LOW' | 'AVERAGE' | 'HIGH' | 'NO_COMPETITORS';
  averageMarketPrice: number;
  priceDifferencePercentage: number;
  analysisMessage: string;
  suggestedAction: string;
  amenitiesOpportunities: string[];
  salesFrictionWarnings: string[];
}

/**
 * Generates marketing intelligence advice for a vendor when listing a new hall.
 * Performs database competitor comparisons based on category, price, city, and amenities.
 */
export async function getMarketingAdvice(
  categoryId: string,
  priceDaily: number,
  city: string,
  amenities: string[]
): Promise<{ success: boolean; data?: AdviceReport; message?: string }> {
  try {
    if (!categoryId || isNaN(priceDaily) || !city) {
      return { success: false, message: "Missing required fields for comparison." };
    }

    // 1. Fetch approved competitor listings in the same city and category
    const competitors = await prisma.product.findMany({
      where: {
        categoryId,
        city: { contains: city, mode: 'insensitive' },
        isApproved: true,
        isRentable: true
      },
      select: {
        id: true,
        name: true,
        priceDaily: true,
        amenities: true,
        capacity: true
      }
    });

    const totalCompetitors = competitors.length;

    // Default structure if there are no competitors to compare against
    if (totalCompetitors === 0) {
      return {
        success: true,
        data: {
          priceStatus: 'NO_COMPETITORS',
          averageMarketPrice: 0,
          priceDifferencePercentage: 0,
          analysisMessage: `You are the pioneer! There are currently no other approved halls listed in this category within ${city}.`,
          suggestedAction: "Since you face no direct competition, price standardly and consider running introductory launch discounts.",
          amenitiesOpportunities: [],
          salesFrictionWarnings: ["Make sure to upload high-resolution cover photos to establish immediate customer trust."]
        }
      };
    }

    // 2. Perform price metrics calculation
    const competitorPrices = competitors.map(c => c.priceDaily);
    const sumPrice = competitorPrices.reduce((acc, p) => acc + p, 0);
    const averageMarketPrice = Math.round(sumPrice / totalCompetitors);

    const priceDiff = priceDaily - averageMarketPrice;
    const priceDifferencePercentage = Math.round((priceDiff / (averageMarketPrice || 1)) * 100);

    let priceStatus: 'LOW' | 'AVERAGE' | 'HIGH' = 'AVERAGE';
    let analysisMessage = "";
    let suggestedAction = "";

    if (priceDifferencePercentage > 15) {
      priceStatus = 'HIGH';
      analysisMessage = `Your rate (₹${priceDaily.toLocaleString()}) is ${priceDifferencePercentage}% higher than the average competitor rate (₹${averageMarketPrice.toLocaleString()}) in ${city}.`;
      suggestedAction = "Premium pricing is fine, but you must highlight top-tier specs (e.g. valet parking, catering, staging) in your description to convert bookings.";
    } else if (priceDifferencePercentage < -15) {
      priceStatus = 'LOW';
      analysisMessage = `Your rate (₹${priceDaily.toLocaleString()}) is ${Math.abs(priceDifferencePercentage)}% lower than the competitor average (₹${averageMarketPrice.toLocaleString()}) in ${city}.`;
      suggestedAction = "Highly competitive! This is a great marketing strategy to secure initial bookings and compile high reviews quickly.";
    } else {
      priceStatus = 'AVERAGE';
      analysisMessage = `Your pricing matches the standard competitor average (₹${averageMarketPrice.toLocaleString()}) in ${city}.`;
      suggestedAction = "Ensure your hall pictures look high-quality and add package services (decor, catering) to stand out from average listings.";
    }

    // 3. Perform Amenities Gap Analysis
    // Count occurrence of amenities among competitors
    const amenityCounts: Record<string, number> = {};
    competitors.forEach(c => {
      if (Array.isArray(c.amenities)) {
        c.amenities.forEach(a => {
          const key = a.trim();
          amenityCounts[key] = (amenityCounts[key] || 0) + 1;
        });
      }
    });

    // Find most popular amenities (present in at least 50% of competitor listings)
    const normalizedSelectedAmenities = new Set(amenities.map(a => a.trim().toLowerCase()));
    const amenitiesOpportunities: string[] = [];

    Object.entries(amenityCounts).forEach(([name, count]) => {
      const percentage = (count / totalCompetitors) * 100;
      const isMissing = !normalizedSelectedAmenities.has(name.toLowerCase());
      
      if (percentage >= 50 && isMissing) {
        amenitiesOpportunities.push(
          `${name} (Offered by ${Math.round(percentage)}% of competitors in ${city})`
        );
      }
    });

    // 4. Sales Friction Warnings
    const salesFrictionWarnings: string[] = [];
    if (amenities.length === 0) {
      salesFrictionWarnings.push("You haven't listed any amenities. Halls with zero listed amenities struggle to convert checkouts.");
    }

    return {
      success: true,
      data: {
        priceStatus,
        averageMarketPrice,
        priceDifferencePercentage,
        analysisMessage,
        suggestedAction,
        amenitiesOpportunities,
        salesFrictionWarnings
      }
    };

  } catch (error) {
    console.error("Marketing Advice Engine Failure:", error instanceof Error ? error.message : error);
    return { success: false, message: "Internal server error in advisor analysis." };
  }
}
