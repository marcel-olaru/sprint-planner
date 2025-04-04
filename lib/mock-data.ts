import type { TeamMember, SprintHistory, Settings, PublicHoliday } from "./types"

// Mock team members data with the provided list
export const mockTeamMembers: TeamMember[] = [
  { name: "Luis ALVINS", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "Spain" },
  { name: "Marcel OLARU", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "France" },
  { name: "Iqra LUQMAN", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "Germany" },
  { name: "Viktor MAKSYMENKO", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "Spain" },
  { name: "Abhishek JADHAV", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "France" },
  { name: "Phuong NGUYEN", role: "SDET", capacity: 1.0, daysOff: 0, active: true, country: "France" },
  { name: "Aishwarya RAMESH", role: "SDET", capacity: 0.3, daysOff: 0, active: true, country: "France" },
]

// Mock sprint history data
export const mockSprintHistory: SprintHistory[] = [
  {
    sprint: "Sprint 38",
    startDate: "2023-01-02",
    endDate: "2023-01-15",
    planned: 26,
    completed: 24,
    teamCapacity: 90,
    actualPoints: 24,
    velocity: 0.3, // Example velocity
  },
  {
    sprint: "Sprint 39",
    startDate: "2023-01-16",
    endDate: "2023-01-29",
    planned: 34,
    completed: 32,
    teamCapacity: 95,
    actualPoints: 32,
    velocity: 0.35, // Example velocity
  },
  {
    sprint: "Sprint 40",
    startDate: "2023-01-30",
    endDate: "2023-02-12",
    planned: 30,
    completed: 28,
    teamCapacity: 85,
    actualPoints: 28,
    velocity: 0.32, // Example velocity
  },
  {
    sprint: "Sprint 41",
    startDate: "2023-02-13",
    endDate: "2023-02-26",
    planned: 32,
    completed: 30,
    teamCapacity: 90,
    actualPoints: 30,
    velocity: 0.33, // Example velocity
  },
  {
    sprint: "Sprint 42",
    startDate: "2023-02-27",
    endDate: "2023-03-12",
    planned: 32,
    completed: 28,
    teamCapacity: 80,
    actualPoints: 28,
    velocity: 0.31, // Example velocity
  },
]

// Mock settings
export const mockSettings: Settings = {
  velocityPeriods: 3,
  workingDaysPerSprint: 10,
  roundToFibonacci: true,
  selectedCountry: "France",
}

// Mock public holidays for different countries
export const mockPublicHolidays: PublicHoliday[] = [
  // France
  { date: "2023-01-01", name: "New Year's Day", country: "France" },
  { date: "2023-04-10", name: "Easter Monday", country: "France" },
  { date: "2023-05-01", name: "Labor Day", country: "France" },
  { date: "2023-05-08", name: "Victory in Europe Day", country: "France" },
  { date: "2023-05-18", name: "Ascension Day", country: "France" },
  { date: "2023-05-29", name: "Whit Monday", country: "France" },
  { date: "2023-07-14", name: "Bastille Day", country: "France" },
  { date: "2023-08-15", name: "Assumption Day", country: "France" },
  { date: "2023-11-01", name: "All Saints' Day", country: "France" },
  { date: "2023-11-11", name: "Armistice Day", country: "France" },
  { date: "2023-12-25", name: "Christmas Day", country: "France" },

  // Spain
  { date: "2023-01-01", name: "New Year's Day", country: "Spain" },
  { date: "2023-01-06", name: "Epiphany", country: "Spain" },
  { date: "2023-04-07", name: "Good Friday", country: "Spain" },
  { date: "2023-05-01", name: "Labor Day", country: "Spain" },
  { date: "2023-08-15", name: "Assumption Day", country: "Spain" },
  { date: "2023-10-12", name: "National Day", country: "Spain" },
  { date: "2023-11-01", name: "All Saints' Day", country: "Spain" },
  { date: "2023-12-06", name: "Constitution Day", country: "Spain" },
  { date: "2023-12-08", name: "Immaculate Conception", country: "Spain" },
  { date: "2023-12-25", name: "Christmas Day", country: "Spain" },

  // Germany
  { date: "2023-01-01", name: "New Year's Day", country: "Germany" },
  { date: "2023-04-07", name: "Good Friday", country: "Germany" },
  { date: "2023-04-10", name: "Easter Monday", country: "Germany" },
  { date: "2023-05-01", name: "Labor Day", country: "Germany" },
  { date: "2023-05-18", name: "Ascension Day", country: "Germany" },
  { date: "2023-05-29", name: "Whit Monday", country: "Germany" },
  { date: "2023-10-03", name: "German Unity Day", country: "Germany" },
  { date: "2023-12-25", name: "Christmas Day", country: "Germany" },
  { date: "2023-12-26", name: "St. Stephen's Day", country: "Germany" },
]

// Function to get public holidays for a specific country
export function getPublicHolidaysForCountry(country: string): PublicHoliday[] {
  return mockPublicHolidays.filter((holiday) => holiday.country === country)
}

// Function to count public holidays within a sprint period for a specific country
export function countPublicHolidaysInSprint(startDate: string, endDate: string, country: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return mockPublicHolidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date)
    return holiday.country === country && holidayDate >= start && holidayDate <= end && isWeekday(holidayDate) // Only count holidays that fall on weekdays
  }).length
}

// Helper function to check if a date is a weekday (Monday-Friday)
function isWeekday(date: Date): boolean {
  const day = date.getDay()
  return day !== 0 && day !== 6 // 0 is Sunday, 6 is Saturday
}

// Function to calculate working days in a sprint (excluding weekends)
export function calculateWorkingDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let workingDays = 0

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    if (isWeekday(date)) {
      workingDays++
    }
  }

  return workingDays
}

