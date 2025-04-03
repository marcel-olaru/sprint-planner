/**
 * Sprint Calculator
 *
 * This module handles the calculation of sprint points based on team capacity and velocity
 */

import type { TeamMember, SprintHistory } from "./csv-storage"

interface CalculationOptions {
  velocityPeriods: number
  workingDaysPerSprint: number
  roundToFibonacci: boolean
}

// Calculate the team's capacity for the upcoming sprint
export function calculateTeamCapacity(teamMembers: TeamMember[], workingDaysPerSprint: number): number {
  // If no team members, return 100% capacity
  if (teamMembers.length === 0) return 100

  // Calculate total possible person-days
  const totalPossibleDays = teamMembers.reduce((total, member) => {
    return total + workingDaysPerSprint * member.capacity
  }, 0)

  // Calculate actual available person-days
  const availableDays = teamMembers.reduce((total, member) => {
    const memberAvailableDays = (workingDaysPerSprint - member.daysOff) * member.capacity
    return total + Math.max(0, memberAvailableDays)
  }, 0)

  // Return capacity as a percentage
  return (availableDays / totalPossibleDays) * 100
}

// Calculate the average velocity from previous sprints
export function calculateAverageVelocity(sprintHistory: SprintHistory[], periods: number): number {
  // If no sprint history, return 0
  if (sprintHistory.length === 0) return 0

  // Get the most recent sprints based on the number of periods
  const recentSprints = sprintHistory.slice(-Math.min(periods, sprintHistory.length))

  // Calculate the average completed points
  const totalPoints = recentSprints.reduce((sum, sprint) => sum + sprint.completed, 0)
  return totalPoints / recentSprints.length
}

// Round to nearest Fibonacci number
export function roundToFibonacci(points: number): number {
  const fibonacciSequence = [1, 2, 3, 5, 8, 13, 21, 34, 55]

  // Find the closest Fibonacci number
  let closest = fibonacciSequence[0]
  let minDiff = Math.abs(points - closest)

  for (const fib of fibonacciSequence) {
    const diff = Math.abs(points - fib)
    if (diff < minDiff) {
      minDiff = diff
      closest = fib
    }
  }

  return closest
}

// Calculate recommended points for the next sprint
export function calculateRecommendedPoints(
  sprintHistory: SprintHistory[],
  teamCapacity: number,
  options: CalculationOptions,
): number {
  // Calculate average velocity from previous sprints
  const averageVelocity = calculateAverageVelocity(sprintHistory, options.velocityPeriods)

  // If no history, return a default value
  if (averageVelocity === 0) return 8 // Default starting point

  // Adjust velocity based on team capacity
  const adjustedVelocity = averageVelocity * (teamCapacity / 100)

  // Round to Fibonacci if needed
  if (options.roundToFibonacci) {
    return roundToFibonacci(adjustedVelocity)
  }

  return Math.round(adjustedVelocity)
}

