"use client"

import { Switch } from "@/components/ui/switch"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, UserPlus, Users, Edit, BarChart3, Calendar } from "lucide-react"
import type { TeamMember } from "@/lib/types"

export default function TeamPage() {
  const { toast } = useToast()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState<TeamMember>({
    name: "",
    role: "SDET",
    capacity: 1.0,
    daysOff: 0,
    active: true,
    country: "France",
  })
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch team members from the API
    const fetchTeamMembers = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/team")
        if (!response.ok) {
          throw new Error("Failed to fetch team members")
        }
        const data = await response.json()
        setTeamMembers(data)
      } catch (error) {
        console.error("Error fetching team members:", error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeamMembers()
  }, [toast])

  const handleAddMember = async () => {
    if (!newMember.name.trim()) {
      toast({
        title: "Error",
        description: "Team member name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMember),
      })

      if (!response.ok) {
        throw new Error("Failed to add team member")
      }

      // Refresh the team members list
      const updatedResponse = await fetch("/api/team")
      const updatedTeamMembers = await updatedResponse.json()
      setTeamMembers(updatedTeamMembers)

      setNewMember({
        name: "",
        role: "SDET",
        capacity: 1.0,
        daysOff: 0,
        active: true,
        country: "France",
      })
      setDialogOpen(false)

      toast({
        title: "Team member added",
        description: `${newMember.name} has been added to the team.`,
      })
    } catch (error) {
      console.error("Error adding team member:", error)
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = async () => {
    if (!editingMember?.name.trim() || editIndex === null) {
      toast({
        title: "Error",
        description: "Team member name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/team", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          index: editIndex,
          teamMember: editingMember,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update team member")
      }

      // Refresh the team members list
      const updatedResponse = await fetch("/api/team")
      const updatedTeamMembers = await updatedResponse.json()
      setTeamMembers(updatedTeamMembers)

      setEditDialogOpen(false)

      toast({
        title: "Team member updated",
        description: `${editingMember.name}'s information has been updated.`,
      })
    } catch (error) {
      console.error("Error updating team member:", error)
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (index: number) => {
    const memberName = teamMembers[index].name

    try {
      const response = await fetch("/api/team", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete team member")
      }

      // Refresh the team members list
      const updatedResponse = await fetch("/api/team")
      const updatedTeamMembers = await updatedResponse.json()
      setTeamMembers(updatedTeamMembers)

      toast({
        title: "Team member removed",
        description: `${memberName} has been removed from the team.`,
      })
    } catch (error) {
      console.error("Error removing team member:", error)
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      })
    }
  }

  const startEditMember = (member: TeamMember, index: number) => {
    setEditingMember({ ...member })
    setEditIndex(index)
    setEditDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Developer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "QA":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "SDET":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      case "Designer":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300"
      case "Product Manager":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "Scrum Master":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
    }
  }

  const getCountryEmoji = (country: string) => {
    switch (country) {
      case "France":
        return "🇫🇷"
      case "Spain":
        return "🇪🇸"
      case "Germany":
        return "🇩🇪"
      default:
        return "🌍"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
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
              <Link
                href="/"
                className="text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link href="/team" className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
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

      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Team Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Add and manage team members for sprint planning.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Add Team Member</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400">
                  Add a new team member to include in sprint planning.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter team member name"
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">
                    Role
                  </Label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                    <SelectTrigger
                      id="role"
                      className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="SDET">SDET</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className="text-slate-700 dark:text-slate-300">
                    Country
                  </Label>
                  <Select
                    value={newMember.country}
                    onValueChange={(value) => setNewMember({ ...newMember, country: value })}
                  >
                    <SelectTrigger
                      id="country"
                      className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">🇫🇷 France</SelectItem>
                      <SelectItem value="Spain">🇪🇸 Spain</SelectItem>
                      <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity" className="text-slate-700 dark:text-slate-300">
                    Capacity Factor (0.1 - 1.0)
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={newMember.capacity}
                    onChange={(e) => setNewMember({ ...newMember, capacity: Number.parseFloat(e.target.value) })}
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">1.0 = full-time, 0.5 = half-time, etc.</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="days-off" className="text-slate-700 dark:text-slate-300">
                    Days Off (next sprint)
                  </Label>
                  <Input
                    id="days-off"
                    type="number"
                    min="0"
                    max="10"
                    value={newMember.daysOff}
                    onChange={(e) => setNewMember({ ...newMember, daysOff: Number.parseInt(e.target.value) })}
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-t-lg">
            <CardTitle className="text-slate-800 dark:text-slate-100">Team Members</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage your team roster and availability
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {teamMembers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left font-medium p-3 text-slate-600 dark:text-slate-400">Active</th>
                      <th className="text-left font-medium p-3 text-slate-600 dark:text-slate-400">Name</th>
                      <th className="text-center font-medium p-3 text-slate-600 dark:text-slate-400">Role</th>
                      <th className="text-center font-medium p-3 text-slate-600 dark:text-slate-400">Country</th>
                      <th className="text-center font-medium p-3 text-slate-600 dark:text-slate-400">Capacity</th>
                      <th className="text-center font-medium p-3 text-slate-600 dark:text-slate-400">Days Off</th>
                      <th className="text-right font-medium p-3 text-slate-600 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!member.active ? "opacity-60" : ""}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center">
                            <Switch
                              checked={member.active}
                              onCheckedChange={(checked) => {
                                const updatedMember = { ...member, active: checked }
                                fetch("/api/team", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ index, teamMember: updatedMember }),
                                }).then((response) => {
                                  if (response.ok) {
                                    const updatedMembers = [...teamMembers]
                                    updatedMembers[index].active = checked
                                    setTeamMembers(updatedMembers)
                                  }
                                })
                              }}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-slate-900 dark:text-slate-200 font-medium">{member.name}</td>
                        <td className="text-center p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="text-center p-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800">
                            {getCountryEmoji(member.country)} {member.country}
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
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditMember(member, index)}
                            className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 dark:text-slate-400 dark:hover:text-purple-400 dark:hover:bg-purple-950/30"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(index)}
                            className="text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
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
                <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Your First Team Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Member Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Edit Team Member</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Update team member information.
              </DialogDescription>
            </DialogHeader>
            {editingMember && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name" className="text-slate-700 dark:text-slate-300">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-role" className="text-slate-700 dark:text-slate-300">
                    Role
                  </Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                  >
                    <SelectTrigger
                      id="edit-role"
                      className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="SDET">SDET</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Scrum Master">Scrum Master</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-country" className="text-slate-700 dark:text-slate-300">
                    Country
                  </Label>
                  <Select
                    value={editingMember.country}
                    onValueChange={(value) => setEditingMember({ ...editingMember, country: value })}
                  >
                    <SelectTrigger
                      id="edit-country"
                      className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                    >
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="France">🇫🇷 France</SelectItem>
                      <SelectItem value="Spain">🇪🇸 Spain</SelectItem>
                      <SelectItem value="Germany">🇩🇪 Germany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-capacity" className="text-slate-700 dark:text-slate-300">
                    Capacity Factor (0.1 - 1.0)
                  </Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={editingMember.capacity}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, capacity: Number.parseFloat(e.target.value) })
                    }
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-days-off" className="text-slate-700 dark:text-slate-300">
                    Days Off (next sprint)
                  </Label>
                  <Input
                    id="edit-days-off"
                    type="number"
                    min="0"
                    max="10"
                    value={editingMember.daysOff}
                    onChange={(e) => setEditingMember({ ...editingMember, daysOff: Number.parseInt(e.target.value) })}
                    className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-500"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <Button onClick={handleEditMember} className="bg-purple-600 hover:bg-purple-700 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="container">
          Sprint Planner &copy; {new Date().getFullYear()} - A lightweight sprint planning tool
        </div>
      </footer>
    </div>
  )
}

