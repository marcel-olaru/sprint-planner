import { type NextRequest, NextResponse } from "next/server"
import { getSprintHistory, saveSprintHistory, type SprintHistory } from "@/lib/csv-storage"
import { getSprintHistoryClient, saveSprintHistoryClient } from "@/app/fallback-storage"

// Add these two lines for static export compatibility
export const dynamic = "force-static";
export const revalidate = false;

// Determine if we're running on GitHub Pages (static export)
const isStaticExport = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true"

export async function GET() {
  try {
    // Use the appropriate storage method based on deployment
    const sprintHistory = isStaticExport ? await getSprintHistoryClient() : await getSprintHistory()

    return NextResponse.json(sprintHistory)
  } catch (error) {
    console.error("Error fetching sprint history:", error)
    return NextResponse.json({ error: "Failed to fetch sprint history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sprint = (await request.json()) as SprintHistory

    // Validate the sprint data
    if (!sprint.sprint || !sprint.startDate || !sprint.endDate) {
      return NextResponse.json({ error: "Sprint name, start date, and end date are required" }, { status: 400 })
    }

    // Use the appropriate storage method based on deployment
    const sprintHistory = isStaticExport ? await getSprintHistoryClient() : await getSprintHistory()

    sprintHistory.push(sprint)

    if (isStaticExport) {
      await saveSprintHistoryClient(sprintHistory)
    } else {
      await saveSprintHistory(sprintHistory)
    }

    return NextResponse.json(sprint, { status: 201 })
  } catch (error) {
    console.error("Error adding sprint:", error)
    return NextResponse.json({ error: "Failed to add sprint" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { index, sprint } = (await request.json()) as { index: number; sprint: SprintHistory }

    // Validate the sprint data
    if (!sprint.sprint || !sprint.startDate || !sprint.endDate) {
      return NextResponse.json({ error: "Sprint name, start date, and end date are required" }, { status: 400 })
    }

    // Use the appropriate storage method based on deployment
    const sprintHistory = isStaticExport ? await getSprintHistoryClient() : await getSprintHistory()

    // Check if the index is valid
    if (index < 0 || index >= sprintHistory.length) {
      return NextResponse.json({ error: "Invalid sprint index" }, { status: 400 })
    }

    sprintHistory[index] = sprint

    if (isStaticExport) {
      await saveSprintHistoryClient(sprintHistory)
    } else {
      await saveSprintHistory(sprintHistory)
    }

    return NextResponse.json(sprint)
  } catch (error) {
    console.error("Error updating sprint:", error)
    return NextResponse.json({ error: "Failed to update sprint" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { index } = (await request.json()) as { index: number }

    // Use the appropriate storage method based on deployment
    const sprintHistory = isStaticExport ? await getSprintHistoryClient() : await getSprintHistory()

    // Check if the index is valid
    if (index < 0 || index >= sprintHistory.length) {
      return NextResponse.json({ error: "Invalid sprint index" }, { status: 400 })
    }

    sprintHistory.splice(index, 1)

    if (isStaticExport) {
      await saveSprintHistoryClient(sprintHistory)
    } else {
      await saveSprintHistory(sprintHistory)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sprint:", error)
    return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 })
  }
}

