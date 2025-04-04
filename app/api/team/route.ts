import { type NextRequest, NextResponse } from "next/server"
import { mockTeamMembers } from "@/lib/mock-data"
import type { TeamMember } from "@/lib/types"

// In-memory storage for team members (initialized with mock data)
const teamMembers = [...mockTeamMembers]

export async function GET() {
  try {
    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const teamMember = (await request.json()) as TeamMember

    // Validate the team member data
    if (!teamMember.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    teamMembers.push(teamMember)

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { index, teamMember } = (await request.json()) as { index: number; teamMember: TeamMember }

    // Validate the team member data
    if (!teamMember.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if the index is valid
    if (index < 0 || index >= teamMembers.length) {
      return NextResponse.json({ error: "Invalid team member index" }, { status: 400 })
    }

    teamMembers[index] = teamMember

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { index } = (await request.json()) as { index: number }

    // Check if the index is valid
    if (index < 0 || index >= teamMembers.length) {
      return NextResponse.json({ error: "Invalid team member index" }, { status: 400 })
    }

    teamMembers.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}

// Toggle team member active status
export async function PATCH(request: NextRequest) {
  try {
    const { index, active } = (await request.json()) as { index: number; active: boolean }

    // Check if the index is valid
    if (index < 0 || index >= teamMembers.length) {
      return NextResponse.json({ error: "Invalid team member index" }, { status: 400 })
    }

    teamMembers[index] = {
      ...teamMembers[index],
      active,
    }

    return NextResponse.json(teamMembers[index])
  } catch (error) {
    console.error("Error toggling team member status:", error)
    return NextResponse.json({ error: "Failed to toggle team member status" }, { status: 500 })
  }
}

