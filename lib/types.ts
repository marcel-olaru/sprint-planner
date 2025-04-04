export interface TeamMember {
  name: string
  role: string
  capacity: number
  daysOff: number
  active: boolean // To toggle inclusion in sprint calculations
  country: string // Country for public holidays
}

// Sprint history interface
export interface SprintHistory {
  sprint: string
  startDate: string
  endDate: string
  planned: number
  completed: number
  teamCapacity: number
  actualPoints?: number // Manually added points completed
  velocity?: number // Sprint velocity calculation
}

// Settings interface
export interface Settings {
  velocityPeriods: number
  workingDaysPerSprint: number
  roundToFibonacci: boolean
  selectedCountry: string // For public holidays
}

// Public holiday interface
export interface PublicHoliday {
  date: string
  name: string
  country: string
}

