"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    velocityPeriods: 3,
    workingDaysPerSprint: 10,
    roundToFibonacci: true,
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("sprintSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSaveSettings = () => {
    // Validate inputs
    if (settings.velocityPeriods < 1) {
      toast({
        title: "Error",
        description: "Velocity periods must be at least 1",
        variant: "destructive",
      })
      return
    }

    if (settings.workingDaysPerSprint < 1) {
      toast({
        title: "Error",
        description: "Working days per sprint must be at least 1",
        variant: "destructive",
      })
      return
    }

    // Save to localStorage
    localStorage.setItem("sprintSettings", JSON.stringify(settings))

    toast({
      title: "Settings saved",
      description: "Your calculation settings have been updated.",
    })
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (!e.target) {
          throw new Error("Event target is null");
        }
        const target = e.target as FileReader;
        const result = target.result as string;
        
        if (typeof result !== 'string') {
          throw new Error("File content is not text");
        }
      
        const data = JSON.parse(result)

        // Validate the imported data
        if (data.teamMembers && Array.isArray(data.teamMembers)) {
          localStorage.setItem("teamMembers", JSON.stringify(data.teamMembers))
        }

        if (data.sprintHistory && Array.isArray(data.sprintHistory)) {
          localStorage.setItem("sprintHistory", JSON.stringify(data.sprintHistory))
        }

        toast({
          title: "Data imported",
          description: "Your data has been imported successfully. Refresh the page to see changes.",
        })
      } catch (error) {
        toast({
          title: "Import error",
          description: "There was an error importing your data. Please check the file format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.removeItem("teamMembers")
      localStorage.removeItem("sprintHistory")
      localStorage.removeItem("sprintSettings")

      toast({
        title: "Data reset",
        description: "All data has been reset. Refresh the page to see changes.",
      })
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your Sprint Planner application.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calculation Settings</CardTitle>
            <CardDescription>Configure how sprint points are calculated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="velocity-periods">Velocity Calculation Periods</Label>
              <Input
                id="velocity-periods"
                type="number"
                min="1"
                value={settings.velocityPeriods}
                onChange={(e) => setSettings({ ...settings, velocityPeriods: Number.parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Number of previous sprints to consider when calculating average velocity
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="working-days">Working Days per Sprint</Label>
              <Input
                id="working-days"
                type="number"
                min="1"
                value={settings.workingDaysPerSprint}
                onChange={(e) => setSettings({ ...settings, workingDaysPerSprint: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="round-points" className="block">
                  Round calculated points
                </Label>
                <p className="text-xs text-muted-foreground">
                  Round to nearest Fibonacci number (1, 2, 3, 5, 8, 13, 21)
                </p>
              </div>
              <Switch
                id="round-points"
                checked={settings.roundToFibonacci}
                onCheckedChange={(checked) => setSettings({ ...settings, roundToFibonacci: checked })}
              />
            </div>

            <Button onClick={handleSaveSettings}>Save Calculation Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Import, export, or reset your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="import-data">Import Data</Label>
              <Input id="import-data" type="file" accept=".json" onChange={handleImportData} />
              <p className="text-xs text-muted-foreground">Import team members and sprint history from a JSON file</p>
            </div>

            <div className="grid gap-2">
              <Label>Export Data</Label>
              <Button
                variant="outline"
                onClick={() => {
                  // Export data as JSON
                  const data = {
                    teamMembers: JSON.parse(localStorage.getItem("teamMembers") || "[]"),
                    sprintHistory: JSON.parse(localStorage.getItem("sprintHistory") || "[]"),
                    settings: JSON.parse(localStorage.getItem("sprintSettings") || "{}"),
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "sprint-data.json"
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Export All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Download all your data as a JSON file for backup or transfer
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Reset Data</Label>
              <Button variant="destructive" onClick={handleResetData}>
                Reset All Data
              </Button>
              <p className="text-xs text-muted-foreground">
                Warning: This will delete all team members, sprint history, and settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

