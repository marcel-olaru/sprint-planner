"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateTeamCapacity, calculateSprintVelocity, calculateExpectedPoints } from "@/lib/sprint-calculator"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, BarChart3, Users, Calendar, ArrowRight, Flag } from "lucide-react"
import type { TeamMember, SprintHistory, Settings } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { calculateWorkingDays } from "@/lib/mock-data"

export default function Home() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [sprintHistory, setSprintHistory] = useState<SprintHistory[]>([])
  const [settings, setSettings] = useState<Settings>({
    velocityPeriods: 3,
    workingDaysPerSprint: 10,
    roundToFibonacci: true,
    selectedCountry: "France",
  })
  const [loading, setLoading] = useState(true)
  const [publicHolidays, setPublicHolidays] = useState<number>(0)
  const [totalManDays, setTotalManDays] = useState<number>(0)
  const [actualPoints, setActualPoints] = useState<number>(0)
  const [sprintVelocity, setSprintVelocity] = useState<number>(0)
  const [expectedPoints, setExpectedPoints] = useState<number>(0)
  const [currentSprint, setCurrentSprint] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 13)).toISOString().split("T")[0],
  })
  const [workingDays, setWorkingDays] = useState<number>(10)
  const [memberHolidays, setMemberHolidays] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    // Load data from API
    const loadData = async () => {
      try {
        setLoading(true)

        // Fetch team members
        const teamResponse = await fetch("/api/team")
        if (!teamResponse.ok) {
          throw new Error("Failed to fetch team members")
        }
        const teamData = await teamResponse.json()
        setTeamMembers(teamData)

        // Fetch sprint history
        const sprintResponse = await fetch("/api/sprints")
        if (!sprintResponse.ok) {
          throw new Error("Failed to fetch sprint history")
        }
        const sprintData = await sprintResponse.json()
        setSprintHistory(sprintData)

        // Fetch settings
        const settingsResponse = await fetch("/api/settings")
        if (!settingsResponse.ok) {
          throw new Error("Failed to fetch settings")
        }
        const settingsData = await settingsResponse.json()
        setSettings(settingsData)

        // Set actual points from the most recent sprint
        if (sprintData.length > 0) {
          const lastSprint = sprintData[sprintData.length - 1]
          setActualPoints(lastSprint.actualPoints || 0)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading your data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Calculate working days when sprint dates change
  useEffect(() => {
    const days = calculateWorkingDays(currentSprint.startDate, currentSprint.endDate)
    setWorkingDays(days)
    setSettings((prev) => ({ ...prev, workingDaysPerSprint: days }))
  }, [currentSprint])

  // Fetch public holidays for each team member's country
  useEffect(() => {
    const fetchHolidaysForMembers = async () => {
      const holidays: { [key: string]: number } = {}

      for (const member of teamMembers) {
        try {
          const response = await fetch(
            `/api/holidays?country=${member.country}&startDate=${currentSprint.startDate}&endDate=${currentSprint.endDate}`,
          )
          if (response.ok) {
            const data = await response.json()
            holidays[member.name] = data.count || 0
          }
        } catch (error) {
          console.error(`Error fetching holidays for ${member.name}:`, error)
          holidays[member.name] = 0
        }
      }

      setMemberHolidays(holidays)
    }

    if (teamMembers.length > 0) {
      fetchHolidaysForMembers()
    }
  }, [teamMembers, currentSprint])

  // Fetch public holidays for the selected country
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `/api/holidays?country=${settings.selectedCountry}&startDate=${currentSprint.startDate}&endDate=${currentSprint.endDate}`,
        )
        if (response.ok) {
          const data = await response.json()
          setPublicHolidays(data.count || 0)
        }
      } catch (error) {
        console.error("Error fetching holidays:", error)
      }
    }

    fetchHolidays()
  }, [settings.selectedCountry, currentSprint])

  // Calculate total man-days, velocity, and expected points
  useEffect(() => {
    // Calculate total man-days considering each member's country holidays
    let totalDays = 0

    for (const member of teamMembers) {
      if (member.active) {
        const memberHolidayCount = memberHolidays[member.name] || 0
        const availableDays = Math.max(0, workingDays - memberHolidayCount - member.daysOff)
        totalDays += availableDays * member.capacity
      }
    }

    setTotalManDays(totalDays)

    const velocity = calculateSprintVelocity(actualPoints, totalDays)
    setSprintVelocity(velocity)

    const points = calculateExpectedPoints(velocity, totalDays)
    setExpectedPoints(points)
  }, [teamMembers, workingDays, memberHolidays, actualPoints])

  // Toggle team member active status
  const toggleTeamMemberActive = async (index: number, active: boolean) => {
    try {
      const response = await fetch("/api/team", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index, active }),
      })

      if (response.ok) {
        const updatedTeamMembers = [...teamMembers]
        updatedTeamMembers[index].active = active
        setTeamMembers(updatedTeamMembers)
      }
    } catch (error) {
      console.error("Error toggling team member status:", error)
      toast({
        title: "Error",
        description: "Failed to update team member status",
        variant: "destructive",
      })
    }
  }

  // Update team member days off
  const updateTeamMemberDaysOff = async (index: number, daysOff: number) => {
    try {
      const teamMember = { ...teamMembers[index], daysOff }

      const response = await fetch("/api/team", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index, teamMember }),
      })

      if (response.ok) {
        const updatedTeamMembers = [...teamMembers]
        updatedTeamMembers[index].daysOff = daysOff
        setTeamMembers(updatedTeamMembers)
      }
    } catch (error) {
      console.error("Error updating team member days off:", error)
      toast({
        title: "Error",
        description: "Failed to update team member days off",
        variant: "destructive",
      })
    }
  }

  // Update actual points completed
  const handleActualPointsChange = (value: number) => {
    setActualPoints(value)
  }

  // Change selected country for public holidays
  const handleCountryChange = (country: string) => {
    setSettings((prev) => ({ ...prev, selectedCountry: country }))
  }

  // Calculate team capacity
  const teamCapacity = teamMembers.length > 0 ? calculateTeamCapacity(teamMembers, workingDays, publicHolidays) : 100

  // Get the previous sprint data
  const previousSprint = sprintHistory.length > 0 ? sprintHistory[sprintHistory.length - 1] : null

  // Calculate the next sprint number
  const nextSprintNumber = previousSprint ? Number.parseInt(previousSprint.sprint.split(" ")[1]) + 1 : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/80 dark:border-slate-700">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <div className="bg-purple-600 text-white p-1.5 rounded-md">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">Sprint Planner</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/team"
                className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                <span>Team</span>
              </Link>
              <Link
                href="/history"
                className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="h-4 w-4" />
                <span>History</span>
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Link
              href="/settings"
              className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors text-sm"
            >
              Settings
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="grid gap-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sprint Planning</h1>
              <p className="text-slate-500 dark:text-slate-400">Calculate your team's capacity for the next sprint.</p>
            </div>
            <Link href="/new-sprint">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Sprint
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {previousSprint ? (
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-t-lg">
                  <CardTitle className="text-slate-800 dark:text-slate-100">Previous Sprint</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {previousSprint.sprint} ({previousSprint.startDate} - {previousSprint.endDate})
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {previousSprint.planned} points
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Completed: {previousSprint.completed} points (
                    {Math.round((previousSprint.completed / previousSprint.planned) * 100)}%)
                  </p>
                  <div className="mt-4 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full ${
                        (previousSprint.completed / previousSprint.planned) >= 0.9
                          ? "bg-green-500"
                          : previousSprint.completed / previousSprint.planned >= 0.7
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, (previousSprint.completed / previousSprint.planned) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Link href="/history">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/50"
                      >
                        View History
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-t-lg">
                  <CardTitle className="text-slate-800 dark:text-slate-100">Previous Sprint</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    No previous sprint data
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-slate-500 dark:text-slate-400">No data</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Add your first sprint to get started
                  </p>
                  <div className="mt-6 flex justify-end">
                    <Link href="/new-sprint">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/50"
                      >
                        Create Sprint
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-100">Team Capacity</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Sprint {nextSprintNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{Math.round(teamCapacity)}%</div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {teamMembers.filter((m) => m.daysOff > 0).length} team member(s) with planned time off
                </p>
                <div className="mt-4 grid grid-cols-10 gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 rounded-full ${i < Math.round(teamCapacity / 10) ? "bg-blue-500" : "bg-slate-100 dark:bg-slate-700"}`}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Link href="/team">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                    >
                      Manage Team
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-t-lg">
                <CardTitle className="text-slate-800 dark:text-slate-100">Sprint Metrics</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Velocity and Expected Points
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="actual-points" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Actual Points Completed (Previous Sprint)
                    </Label>
                    <Input
                      id="actual-points"
                      type="number"
                      min="0"
                      value={actualPoints}
                      onChange={(e) => handleActualPointsChange(Number.parseInt(e.target.value) || 0)}
                      className="mt-1 border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Total Man-Days</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">{totalManDays.toFixed(1)}</div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400">Sprint Velocity</div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {sprintVelocity.toFixed(2)} pts/day
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300">Expected Points</div>
                    <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                      {expectedPoints} points
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Based on velocity and available man-days
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-t-lg">
              <CardTitle className="text-slate-800 dark:text-slate-100">Team Member Availability</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Days off and capacity for Sprint {nextSprintNumber}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {teamMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left font-medium p-2 text-slate-600 dark:text-slate-400">Active</th>
                        <th className="text-left font-medium p-2 text-slate-600 dark:text-slate-400">Team Member</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Role</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Country</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Days Off</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">
                          Public Holidays
                        </th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">
                          Available Days
                        </th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Capacity %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => {
                        const memberHolidayCount = memberHolidays[member.name] || 0
                        const availableDays = Math.max(0, workingDays - memberHolidayCount - member.daysOff)

                        return (
                          <tr
                            key={index}
                            className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!member.active ? "opacity-60" : ""}`}
                          >
                            <td className="p-3">
                              <div className="flex items-center">
                                <Switch
                                  checked={member.active}
                                  onCheckedChange={(checked) => toggleTeamMemberActive(index, checked)}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </div>
                            </td>
                            <td className="p-3 text-slate-900 dark:text-slate-200 font-medium">{member.name}</td>
                            <td className="text-center p-3 text-slate-700 dark:text-slate-300">{member.role}</td>
                            <td className="text-center p-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800">
                                {member.country === "France" ? "🇫🇷" : member.country === "Spain" ? "🇪🇸" : "🇩🇪"}{" "}
                                {member.country}
                              </span>
                            </td>
                            <td className="text-center p-3">
                              <Select
                                value={member.daysOff.toString()}
                                onValueChange={(value) => updateTeamMemberDaysOff(index, Number.parseInt(value))}
                              >
                                <SelectTrigger className="w-20 mx-auto">
                                  <SelectValue placeholder="0" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[...Array(11)].map((_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      {i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="text-center p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  memberHolidayCount > 0
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {memberHolidayCount}
                              </span>
                            </td>
                            <td className="text-center p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  availableDays < (workingDays / 2)
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {availableDays}
                              </span>
                            </td>
                            <td className="text-center p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.capacity < 0.8
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                }`}
                              >
                                {Math.round(member.capacity * 100)}%
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <td colSpan={6} className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          Total Sprint Man-Days
                        </td>
                        <td colSpan={2} className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {totalManDays.toFixed(1)} days
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/20 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400 mb-4">No team members added yet</p>
                  <Link href="/team">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      <Users className="mr-2 h-4 w-4" />
                      Add Team Members
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Public Holidays Card - Moved to the bottom */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-t-lg">
              <CardTitle className="text-slate-800 dark:text-slate-100">Public Holidays</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Select your country for public holidays
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    settings.selectedCountry === "France"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-slate-700 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
                  }`}
                  onClick={() => handleCountryChange("France")}
                >
                  <div className="flex-1">
                    <div className="text-lg font-medium">🥐 Public Holidays 🇫🇷 🥐</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">France</div>
                  </div>
                  {settings.selectedCountry === "France" && (
                    <div className="text-purple-600 dark:text-purple-400">
                      <Flag className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    settings.selectedCountry === "Spain"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-slate-700 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
                  }`}
                  onClick={() => handleCountryChange("Spain")}
                >
                  <div className="flex-1">
                    <div className="text-lg font-medium">🥘 Public Holidays 🇪🇸 🥘</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Spain</div>
                  </div>
                  {settings.selectedCountry === "Spain" && (
                    <div className="text-purple-600 dark:text-purple-400">
                      <Flag className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                    settings.selectedCountry === "Germany"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 dark:border-slate-700 dark:hover:border-purple-700 dark:hover:bg-purple-900/10"
                  }`}
                  onClick={() => handleCountryChange("Germany")}
                >
                  <div className="flex-1">
                    <div className="text-lg font-medium">🥨 Public Holidays 🇩🇪 🥨</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Germany</div>
                  </div>
                  {settings.selectedCountry === "Germany" && (
                    <div className="text-purple-600 dark:text-purple-400">
                      <Flag className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                    {publicHolidays} public holidays in the sprint period ({currentSprint.startDate} to{" "}
                    {currentSprint.endDate})
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="container">
          Sprint Planner &copy; {new Date().getFullYear()} - A lightweight sprint planning tool
        </div>
      </footer>
    </div>
  )
}

