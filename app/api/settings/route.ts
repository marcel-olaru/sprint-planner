import { type NextRequest, NextResponse } from "next/server"
import { mockSettings } from "@/lib/mock-data"
import type { Settings } from "@/lib/types"

// In-memory storage for settings (initialized with mock data)
let settings: Settings = { ...mockSettings }

export async function GET() {
  try {
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const newSettings = (await request.json()) as Settings

    // Validate the settings
    if (newSettings.velocityPeriods < 1) {
      return NextResponse.json({ error: "Velocity periods must be at least 1" }, { status: 400 })
    }

    if (newSettings.workingDaysPerSprint < 1) {
      return NextResponse.json({ error: "Working days per sprint must be at least 1" }, { status: 400 })
    }

    settings = { ...newSettings }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

