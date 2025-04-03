"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

export default function HistoryPage() {
  const [sprintHistory, setSprintHistory] = useState([])

  useEffect(() => {
    // Load sprint history from localStorage
    const savedSprintHistory = localStorage.getItem("sprintHistory")
    if (savedSprintHistory) {
      setSprintHistory(JSON.parse(savedSprintHistory))
    }
  }, [])

  // Calculate completion percentages for all sprints
  const completionPercentages = sprintHistory.map((sprint) => Math.round((sprint.completed / sprint.planned) * 100))

  // Get the maximum completed points for scaling the chart
  const maxCompletedPoints = sprintHistory.length > 0 ? Math.max(...sprintHistory.map((sprint) => sprint.completed)) : 0

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sprint History</h1>
          <p className="text-muted-foreground">Review past sprint performance and metrics.</p>
        </div>
      </div>

      {sprintHistory.length > 0 ? (
        <Tabs defaultValue="performance">
          <TabsList className="mb-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="details">Sprint Details</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Velocity Trend</CardTitle>
                  <CardDescription>Points completed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-end gap-2">
                    {sprintHistory.map((sprint, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-primary rounded-t-md"
                          style={{ height: `${(sprint.completed / maxCompletedPoints) * 100}%` }}
                        ></div>
                        <div className="mt-2 text-xs">{sprint.sprint}</div>
                        <div className="text-xs text-muted-foreground">{sprint.completed} pts</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate</CardTitle>
                    <CardDescription>Percentage of planned points completed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end gap-2">
                      {sprintHistory.map((sprint, index) => {
                        const percentage = Math.round((sprint.completed / sprint.planned) * 100)
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-full rounded-t-md ${percentage >= 90 ? "bg-green-500" : percentage >= 75 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ height: `${percentage}%` }}
                            ></div>
                            <div className="mt-2 text-xs">{sprint.sprint}</div>
                            <div className="text-xs text-muted-foreground">{percentage}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Capacity</CardTitle>
                    <CardDescription>Available capacity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-end gap-2">
                      {sprintHistory.map((sprint, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-primary rounded-t-md"
                            style={{ height: `${sprint.teamCapacity}%` }}
                          ></div>
                          <div className="mt-2 text-xs">{sprint.sprint}</div>
                          <div className="text-xs text-muted-foreground">{sprint.teamCapacity}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Summary</CardTitle>
                <CardDescription>Detailed metrics for past sprints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Sprint</th>
                        <th className="text-center font-medium p-2">Dates</th>
                        <th className="text-center font-medium p-2">Planned</th>
                        <th className="text-center font-medium p-2">Completed</th>
                        <th className="text-center font-medium p-2">Completion %</th>
                        <th className="text-center font-medium p-2">Team Capacity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprintHistory.map((sprint, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{sprint.sprint}</td>
                          <td className="text-center p-2">
                            {sprint.startDate} - {sprint.endDate}
                          </td>
                          <td className="text-center p-2">{sprint.planned}</td>
                          <td className="text-center p-2">{sprint.completed}</td>
                          <td className="text-center p-2">{Math.round((sprint.completed / sprint.planned) * 100)}%</td>
                          <td className="text-center p-2">{sprint.teamCapacity}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No sprint history available</p>
            <Link href="/new-sprint">
              <Button>Create Your First Sprint</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

