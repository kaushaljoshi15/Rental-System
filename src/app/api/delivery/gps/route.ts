import { NextResponse } from "next/server"
import { updateDriverLocation } from "@/actions/delivery"

export async function POST(request: Request) {
  try {
    const { deliveryId, latitude, longitude } = await request.json()

    if (!deliveryId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters (deliveryId, latitude, longitude)" },
        { status: 400 }
      )
    }

    const result = await updateDriverLocation(deliveryId, latitude, longitude)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process location stream." },
      { status: 500 }
    )
  }
}
