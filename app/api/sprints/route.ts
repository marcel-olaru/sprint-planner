import { type NextRequest, NextResponse } from "next/server"
import { mockSprintHistory } from "@/lib/mock-data"
import type { SprintHistory } from "@/lib/types"

// In-memory storage for sprint history (initialized with mock data)
const sprintHistory = [...mockSprintHistory]

export async function GET() {
  try {
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

    sprintHistory.push(sprint)

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

    // Check if the index is valid
    if (index < 0 || index >= sprintHistory.length) {
      return NextResponse.json({ error: "Invalid sprint index" }, { status: 400 })
    }

    sprintHistory[index] = sprint

    return NextResponse.json(sprint)
  } catch (error) {
    console.error("Error updating sprint:", error)
    return NextResponse.json({ error: "Failed to update sprint" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { index } = (await request.json()) as { index: number }

    // Check if the index is valid
    if (index < 0 || index >= sprintHistory.length) {
      return NextResponse.json({ error: "Invalid sprint index" }, { status: 400 })
    }

    sprintHistory.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sprint:", error)
    return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 })
  }
}

