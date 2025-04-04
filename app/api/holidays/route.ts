import { NextResponse } from "next/server"
import { getPublicHolidaysForCountry, countPublicHolidaysInSprint } from "@/lib/mock-data"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get("country")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (country) {
      if (startDate && endDate) {
        // Count holidays in a sprint period
        const count = countPublicHolidaysInSprint(startDate, endDate, country)
        return NextResponse.json({ count })
      } else {
        // Get all holidays for a country
        const holidays = getPublicHolidaysForCountry(country)
        return NextResponse.json(holidays)
      }
    }

    return NextResponse.json({ error: "Country parameter is required" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching holidays:", error)
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 })
  }
}

