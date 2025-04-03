import { type NextRequest, NextResponse } from "next/server"
import { getTeamMembers, saveTeamMembers, type TeamMember } from "@/lib/csv-storage"
import { getTeamMembersClient, saveTeamMembersClient } from "@/app/fallback-storage"

// Add these two lines for static export compatibility
export const dynamic = "force-static";
export const revalidate = false;

// Determine if we're running on GitHub Pages (static export)
const isStaticExport = process.env.NEXT_PUBLIC_GITHUB_PAGES === "true"

export async function GET() {
  try {
    // Use the appropriate storage method based on deployment
    const teamMembers = isStaticExport ? await getTeamMembersClient() : await getTeamMembers()

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

    // Use the appropriate storage method based on deployment
    const teamMembers = isStaticExport ? await getTeamMembersClient() : await getTeamMembers()

    teamMembers.push(teamMember)

    if (isStaticExport) {
      await saveTeamMembersClient(teamMembers)
    } else {
      await saveTeamMembers(teamMembers)
    }

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

    // Use the appropriate storage method based on deployment
    const teamMembers = isStaticExport ? await getTeamMembersClient() : await getTeamMembers()

    // Check if the index is valid
    if (index < 0 || index >= teamMembers.length) {
      return NextResponse.json({ error: "Invalid team member index" }, { status: 400 })
    }

    teamMembers[index] = teamMember

    if (isStaticExport) {
      await saveTeamMembersClient(teamMembers)
    } else {
      await saveTeamMembers(teamMembers)
    }

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { index } = (await request.json()) as { index: number }

    // Use the appropriate storage method based on deployment
    const teamMembers = isStaticExport ? await getTeamMembersClient() : await getTeamMembers()

    // Check if the index is valid
    if (index < 0 || index >= teamMembers.length) {
      return NextResponse.json({ error: "Invalid team member index" }, { status: 400 })
    }

    teamMembers.splice(index, 1)

    if (isStaticExport) {
      await saveTeamMembersClient(teamMembers)
    } else {
      await saveTeamMembers(teamMembers)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}

