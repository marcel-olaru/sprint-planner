/**
 * Fallback storage for GitHub Pages deployment
 *
 * This module provides localStorage-based storage when deployed to GitHub Pages,
 * which doesn't support server-side file operations
 */

import type { TeamMember, SprintHistory } from "@/lib/csv-storage"

// Check if we're running on the client side
const isClient = typeof window !== "undefined"

// Team member functions
export async function getTeamMembersClient(): Promise<TeamMember[]> {
  if (!isClient) return []

  try {
    const data = localStorage.getItem("teamMembers")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading team members from localStorage:", error)
    return []
  }
}

export async function saveTeamMembersClient(teamMembers: TeamMember[]): Promise<void> {
  if (!isClient) return

  try {
    localStorage.setItem("teamMembers", JSON.stringify(teamMembers))
  } catch (error) {
    console.error("Error saving team members to localStorage:", error)
  }
}

// Sprint history functions
export async function getSprintHistoryClient(): Promise<SprintHistory[]> {
  if (!isClient) return []

  try {
    const data = localStorage.getItem("sprintHistory")
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Error reading sprint history from localStorage:", error)
    return []
  }
}

export async function saveSprintHistoryClient(sprintHistory: SprintHistory[]): Promise<void> {
  if (!isClient) return

  try {
    localStorage.setItem("sprintHistory", JSON.stringify(sprintHistory))
  } catch (error) {
    console.error("Error saving sprint history to localStorage:", error)
  }
}

// Settings functions
export async function getSettingsClient(): Promise<Record<string, any>> {
  if (!isClient)
    return {
      velocityPeriods: 3,
      workingDaysPerSprint: 10,
      roundToFibonacci: true,
    }

  try {
    const data = localStorage.getItem("settings")
    return data
      ? JSON.parse(data)
      : {
          velocityPeriods: 3,
          workingDaysPerSprint: 10,
          roundToFibonacci: true,
        }
  } catch (error) {
    console.error("Error reading settings from localStorage:", error)
    return {
      velocityPeriods: 3,
      workingDaysPerSprint: 10,
      roundToFibonacci: true,
    }
  }
}

export async function saveSettingsClient(settings: Record<string, any>): Promise<void> {
  if (!isClient) return

  try {
    localStorage.setItem("settings", JSON.stringify(settings))
  } catch (error) {
    console.error("Error saving settings to localStorage:", error)
  }
}

