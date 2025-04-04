import type { TeamMember, SprintHistory, Settings } from "./types"

// Calculate the team's capacity for the upcoming sprint
export function calculateTeamCapacity(
  teamMembers: TeamMember[],
  workingDaysPerSprint: number,
  publicHolidays = 0,
): number {
  // Filter active team members only
  const activeMembers = teamMembers.filter((member) => member.active)

  // If no active team members, return 0% capacity
  if (activeMembers.length === 0) return 0

  // Calculate total possible person-days
  const totalPossibleDays = activeMembers.reduce((total, member) => {
    return total + (workingDaysPerSprint - publicHolidays) * member.capacity
  }, 0)

  // Calculate actual available person-days
  const availableDays = activeMembers.reduce((total, member) => {
    const memberAvailableDays = (workingDaysPerSprint - publicHolidays - member.daysOff) * member.capacity
    return total + Math.max(0, memberAvailableDays)
  }, 0)

  // Return capacity as a percentage
  return (availableDays / totalPossibleDays) * 100
}

// Calculate total sprint man-days for the team
export function calculateTotalSprintManDays(
  teamMembers: TeamMember[],
  workingDaysPerSprint: number,
  publicHolidays = 0,
): number {
  // Filter active team members only
  const activeMembers = teamMembers.filter((member) => member.active)

  // Calculate total available man-days
  return activeMembers.reduce((total, member) => {
    const availableDays = (workingDaysPerSprint - publicHolidays - member.daysOff) * member.capacity
    return total + Math.max(0, availableDays)
  }, 0)
}

// Calculate sprint velocity (points per man-day)
export function calculateSprintVelocity(actualPoints: number, totalManDays: number): number {
  if (totalManDays === 0 || actualPoints === 0) return 0
  return actualPoints / totalManDays
}

// Calculate expected points based on velocity and available man-days
export function calculateExpectedPoints(velocity: number, totalManDays: number): number {
  return Math.round(velocity * totalManDays)
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
  options: Settings,
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

