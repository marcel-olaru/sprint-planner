"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar } from "lucide-react"
import { calculateTeamCapacity, calculateRecommendedPoints } from "@/lib/sprint-calculator"

export default function NewSprintPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [sprintHistory, setSprintHistory] = useState<{
    sprint: string;
    startDate: string;
    endDate: string;
    planned: number;
    completed: number;
    teamCapacity: number;
  }[]>([])
  const [newSprint, setNewSprint] = useState({
    sprint: "",
    startDate: "",
    endDate: "",
    planned: 0,
    completed: 0,
    teamCapacity: 100,
  })

  useEffect(() => {
    // Load data from localStorage
    const savedTeamMembers = localStorage.getItem("teamMembers")
    const savedSprintHistory = localStorage.getItem("sprintHistory")

    if (savedTeamMembers) {
      const members = JSON.parse(savedTeamMembers)
      setTeamMembers(members)

      // Calculate team capacity
      if (members.length > 0) {
        const capacity = calculateTeamCapacity(members, 10)
        setNewSprint((prev) => ({ ...prev, teamCapacity: Math.round(capacity) }))
      }
    }

    if (savedSprintHistory) {
      const history = JSON.parse(savedSprintHistory)
      setSprintHistory(history)

      // Set default sprint number based on history
      if (history.length > 0) {
        const lastSprint = history[history.length - 1]
        const lastSprintNumber = Number.parseInt(lastSprint.sprint.split(" ")[1])
        setNewSprint((prev) => ({
          ...prev,
          sprint: `Sprint ${lastSprintNumber + 1}`,
        }))
      } else {
        setNewSprint((prev) => ({ ...prev, sprint: "Sprint 1" }))
      }
    } else {
      setNewSprint((prev) => ({ ...prev, sprint: "Sprint 1" }))
    }

    // Set default dates (today and today + 14 days)
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 13) // 2 weeks sprint

    setNewSprint((prev) => ({
      ...prev,
      startDate: formatDate(today),
      endDate: formatDate(endDate),
    }))
  }, [])

  // Calculate recommended points whenever team capacity or sprint history changes
  useEffect(() => {
    if (sprintHistory.length > 0) {
      const recommendedPoints = calculateRecommendedPoints(sprintHistory, newSprint.teamCapacity, {
        velocityPeriods: 3,
        workingDaysPerSprint: 10,
        roundToFibonacci: true,
      })

      setNewSprint((prev) => ({ ...prev, planned: recommendedPoints }))
    }
  }, [newSprint.teamCapacity, sprintHistory])

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleCreateSprint = () => {
    // Validate inputs
    if (!newSprint.sprint.trim()) {
      toast({
        title: "Error",
        description: "Sprint name is required",
        variant: "destructive",
      })
      return
    }

    if (!newSprint.startDate || !newSprint.endDate) {
      toast({
        title: "Error",
        description: "Start and end dates are required",
        variant: "destructive",
      })
      return
    }

    if (newSprint.planned <= 0) {
      toast({
        title: "Error",
        description: "Planned points must be greater than zero",
        variant: "destructive",
      })
      return
    }

    // For a new sprint, completed points should be 0
    const sprintToAdd = {
      ...newSprint,
      completed: 0, // New sprints start with 0 completed points
    }

    // Add to sprint history
    const updatedHistory = [...sprintHistory, sprintToAdd]
    setSprintHistory(updatedHistory)

    // Save to localStorage
    localStorage.setItem("sprintHistory", JSON.stringify(updatedHistory))

    toast({
      title: "Sprint created",
      description: `${newSprint.sprint} has been created successfully.`,
    })

    // Navigate back to dashboard
    router.push("/")
  }

  const handleCompleteSprint = () => {
    // Validate inputs
    if (!newSprint.sprint.trim()) {
      toast({
        title: "Error",
        description: "Sprint name is required",
        variant: "destructive",
      })
      return
    }

    if (!newSprint.startDate || !newSprint.endDate) {
      toast({
        title: "Error",
        description: "Start and end dates are required",
        variant: "destructive",
      })
      return
    }

    if (newSprint.planned <= 0) {
      toast({
        title: "Error",
        description: "Planned points must be greater than zero",
        variant: "destructive",
      })
      return
    }

    if (newSprint.completed <= 0) {
      toast({
        title: "Error",
        description: "Completed points must be greater than zero",
        variant: "destructive",
      })
      return
    }

    // Add to sprint history
    const updatedHistory = [...sprintHistory, newSprint]
    setSprintHistory(updatedHistory)

    // Save to localStorage
    localStorage.setItem("sprintHistory", JSON.stringify(updatedHistory))

    toast({
      title: "Sprint completed",
      description: `${newSprint.sprint} has been added to history.`,
    })

    // Navigate back to dashboard
    router.push("/")
  }

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Sprint</h1>
          <p className="text-muted-foreground">Create a new sprint or record a completed sprint.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Details</CardTitle>
            <CardDescription>Enter basic information about the sprint</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="sprint-name">Sprint Name</Label>
              <Input
                id="sprint-name"
                value={newSprint.sprint}
                onChange={(e) => setNewSprint({ ...newSprint, sprint: e.target.value })}
                placeholder="e.g. Sprint 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start-date"
                    type="date"
                    className="pl-10"
                    value={newSprint.startDate}
                    onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end-date"
                    type="date"
                    className="pl-10"
                    value={newSprint.endDate}
                    onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="team-capacity">Team Capacity (%)</Label>
              <Input
                id="team-capacity"
                type="number"
                min="1"
                max="100"
                value={newSprint.teamCapacity}
                onChange={(e) => setNewSprint({ ...newSprint, teamCapacity: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                This is calculated automatically based on team member availability
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sprint Points</CardTitle>
            <CardDescription>Set planned and completed points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="planned-points">Planned Points</Label>
              <Input
                id="planned-points"
                type="number"
                min="1"
                value={newSprint.planned}
                onChange={(e) => setNewSprint({ ...newSprint, planned: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">Recommended based on team capacity and previous velocity</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="completed-points">Completed Points</Label>
              <Input
                id="completed-points"
                type="number"
                min="0"
                value={newSprint.completed}
                onChange={(e) => setNewSprint({ ...newSprint, completed: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Leave at 0 for a new sprint, or enter actual completed points for a finished sprint
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button onClick={handleCreateSprint}>Create New Sprint</Button>
              <Button variant="secondary" onClick={handleCompleteSprint}>
                Record Completed Sprint
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

