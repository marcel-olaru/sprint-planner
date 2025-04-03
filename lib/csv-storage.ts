import fs from "fs/promises"
import path from "path"
import { parse, stringify } from "csv/sync"

// Define the data directory
const DATA_DIR = path.join(process.cwd(), "data")

// Ensure the data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating data directory:", error)
  }
}

// Generic function to read a CSV file
export async function readCsvFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    const fileContent = await fs.readFile(filePath, "utf-8")
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
    }) as T[]
  } catch (error) {
    // If file doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return []
    }
    console.error(`Error reading ${filename}:`, error)
    throw error
  }
}

// Generic function to write to a CSV file
export async function writeCsvFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)

  try {
    const csvContent = stringify(data, { header: true })
    await fs.writeFile(filePath, csvContent, "utf-8")
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    throw error
  }
}

// Team member specific functions
export async function getTeamMembers() {
  return readCsvFile<TeamMember>("team-members.csv")
}

export async function saveTeamMembers(teamMembers: TeamMember[]) {
  return writeCsvFile("team-members.csv", teamMembers)
}

// Sprint history specific functions
export async function getSprintHistory() {
  return readCsvFile<SprintHistory>("sprint-history.csv")
}

export async function saveSprintHistory(sprintHistory: SprintHistory[]) {
  return writeCsvFile("sprint-history.csv", sprintHistory)
}

// Settings specific functions
export async function getSettings() {
  const settings = await readCsvFile<{ key: string; value: string }>("settings.csv")
  if (settings.length === 0) {
    return {
      velocityPeriods: 3,
      workingDaysPerSprint: 10,
      roundToFibonacci: true,
    }
  }

  // Convert the array of key-value pairs to an object
  return settings.reduce(
    (obj, item) => {
      obj[item.key] =
        item.value === "true"
          ? true
          : item.value === "false"
            ? false
            : isNaN(Number(item.value))
              ? item.value
              : Number(item.value)
      return obj
    },
    {} as Record<string, any>,
  )
}

export async function saveSettings(settings: Record<string, any>) {
  // Convert the object to an array of key-value pairs
  const settingsArray = Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value),
  }))

  return writeCsvFile("settings.csv", settingsArray)
}

// Types
export interface TeamMember {
  name: string
  role: string
  capacity: number
  daysOff: number
}

export interface SprintHistory {
  sprint: string
  startDate: string
  endDate: string
  planned: number
  completed: number
  teamCapacity: number
}

