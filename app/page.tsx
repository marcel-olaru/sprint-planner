"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateTeamCapacity, calculateRecommendedPoints } from "@/lib/sprint-calculator"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, BarChart3, Users, Calendar, ArrowRight } from "lucide-react"
import type { TeamMember, SprintHistory } from "@/lib/csv-storage"

export default function Home() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [sprintHistory, setSprintHistory] = useState<SprintHistory[]>([])
  const [settings, setSettings] = useState({
    velocityPeriods: 3,
    workingDaysPerSprint: 10,
    roundToFibonacci: true,
  })
  const [loading, setLoading] = useState(true)

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

  // Calculate team capacity
  const teamCapacity = teamMembers.length > 0 ? calculateTeamCapacity(teamMembers, settings.workingDaysPerSprint) : 100

  // Calculate recommended points
  const recommendedPoints =
    sprintHistory.length > 0 ? calculateRecommendedPoints(sprintHistory, teamCapacity, settings) : 0

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
      <main className="flex-1 container py-8 px-4 md:px-6 lg:px-8">
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
                <CardTitle className="text-slate-800 dark:text-slate-100">Recommended Points</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Based on capacity and velocity
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{recommendedPoints} points</div>
                {previousSprint ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Adjusted from previous {previousSprint.completed} points ({Math.round(teamCapacity)}% capacity)
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Add sprint history to improve this calculation
                  </p>
                )}
                <div className="mt-6 flex justify-end">
                  <Link href="/settings">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                    >
                      Adjust Calculation
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
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
                        <th className="text-left font-medium p-2 text-slate-600 dark:text-slate-400">Team Member</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Role</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">
                          Available Days
                        </th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Days Off</th>
                        <th className="text-center font-medium p-2 text-slate-600 dark:text-slate-400">Capacity %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((member, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="p-3 text-slate-900 dark:text-slate-200 font-medium">{member.name}</td>
                          <td className="text-center p-3 text-slate-700 dark:text-slate-300">{member.role}</td>
                          <td className="text-center p-3 text-slate-700 dark:text-slate-300">
                            {settings.workingDaysPerSprint - member.daysOff}
                          </td>
                          <td className="text-center p-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.daysOff > 0
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}
                            >
                              {member.daysOff}
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
                      ))}
                    </tbody>
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

