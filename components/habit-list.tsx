"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { EditHabitDialog } from "@/components/edit-habit-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Habit } from "@/types/habit"

interface HabitListProps {
  habits: Habit[]
  date: Date
  onToggle: (habitId: string, date: string) => void
  onRemove: (habitId: string) => void
  onUpdate: (habitId: string, updatedHabit: Partial<Habit>) => void
}

export function HabitList({ habits, date, onToggle, onRemove, onUpdate }: HabitListProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const dateStr = format(date, "yyyy-MM-dd")

  const sections = {
    "Body and Mind": habits.filter((h) => h.section === "Body and Mind"),
    "Knowledge and Learning": habits.filter((h) => h.section === "Knowledge and Learning"),
    Misc: habits.filter((h) => h.section === "Misc"),
  }

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const isCompleted = (habit: Habit) => {
    return habit.completedDates.includes(dateStr)
  }

  const handleToggle = (habit: Habit) => {
    onToggle(habit.id, dateStr)
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
  }

  return (
    <div className="space-y-6">
      {Object.entries(sections).map(([section, sectionHabits]) => (
        <div key={section} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleSection(section)}>
            <h3 className="font-medium text-gray-800">{section}</h3>
            <Button variant="ghost" size="sm">
              {collapsedSections[section] ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>

          {!collapsedSections[section] && (
            <div className="px-4 pb-4">
              {sectionHabits.length === 0 ? (
                <p className="text-gray-500 text-sm py-2">No habits in this section</p>
              ) : (
                <div className="space-y-2">
                  {sectionHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md",
                        isCompleted(habit) ? "bg-green-50" : "bg-gray-50",
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isCompleted(habit)}
                          onCheckedChange={() => handleToggle(habit)}
                          className={cn(isCompleted(habit) && "bg-green-500 border-green-500")}
                        />
                        <span className={cn("text-gray-800", isCompleted(habit) && "line-through text-gray-500")}>
                          {habit.name}
                        </span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <svg
                              width="15"
                              height="3"
                              viewBox="0 0 15 3"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M1.5 1.5C1.5 1.89782 1.65804 2.27936 1.93934 2.56066C2.22064 2.84196 2.60218 3 3 3C3.39782 3 3.77936 2.84196 4.06066 2.56066C4.34196 2.27936 4.5 1.89782 4.5 1.5C4.5 1.10218 4.34196 0.720644 4.06066 0.43934C3.77936 0.158035 3.39782 0 3 0C2.60218 0 2.22064 0.158035 1.93934 0.43934C1.65804 0.720644 1.5 1.10218 1.5 1.5ZM7.5 1.5C7.5 1.89782 7.65804 2.27936 7.93934 2.56066C8.22064 2.84196 8.60218 3 9 3C9.39782 3 9.77936 2.84196 10.0607 2.56066C10.342 2.27936 10.5 1.89782 10.5 1.5C10.5 1.10218 10.342 0.720644 10.0607 0.43934C9.77936 0.158035 9.39782 0 9 0C8.60218 0 8.22064 0.158035 7.93934 0.43934C7.65804 0.720644 7.5 1.10218 7.5 1.5ZM13.5 1.5C13.5 1.89782 13.658 2.27936 13.9393 2.56066C14.2206 2.84196 14.6022 3 15 3C15.3978 3 15.7794 2.84196 16.0607 2.56066C16.342 2.27936 16.5 1.89782 16.5 1.5C16.5 1.10218 16.342 0.720644 16.0607 0.43934C15.7794 0.158035 15.3978 0 15 0C14.6022 0 14.2206 0.158035 13.9393 0.43934C13.658 0.720644 13.5 1.10218 13.5 1.5Z"
                                fill="#6B7280"
                              />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(habit)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRemove(habit.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {editingHabit && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onUpdateHabit={(updatedHabit) => {
            onUpdate(editingHabit.id, updatedHabit)
            setEditingHabit(null)
          }}
        />
      )}
    </div>
  )
}
