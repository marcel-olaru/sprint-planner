import { type NextRequest, NextResponse } from "next/server"
import { getSettings, saveSettings } from "@/lib/csv-storage"
import { getSettingsClient, saveSettingsClient } from "@/app/fallback-storage"

// Add these two lines for static export compatibility
export const dynamic = "force-static";
export const revalidate = false;

// Determine if we're running on GitHub Pages (static export)
const isStaticExport = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true"

export async function GET() {
  try {
    // Use the appropriate storage method based on deployment
    const settings = isStaticExport ? await getSettingsClient() : await getSettings()

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Validate the settings
    if (settings.velocityPeriods < 1) {
      return NextResponse.json({ error: "Velocity periods must be at least 1" }, { status: 400 })
    }

    if (settings.workingDaysPerSprint < 1) {
      return NextResponse.json({ error: "Working days per sprint must be at least 1" }, { status: 400 })
    }

    if (isStaticExport) {
      await saveSettingsClient(settings)
    } else {
      await saveSettings(settings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

