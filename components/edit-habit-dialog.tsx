"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Habit } from "@/types/habit"

interface EditHabitDialogProps {
  habit: Habit
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateHabit: (habitId: string, updatedHabit: Partial<Habit>) => Promise<void>
}

export function EditHabitDialog({ habit, open, onOpenChange, onUpdateHabit }: EditHabitDialogProps) {
  const [name, setName] = useState(habit.name)
  const [section, setSection] = useState(habit.section)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(habit.name)
    setSection(habit.section)
  }, [habit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    setIsSubmitting(true)

    try {
      await onUpdateHabit(habit.id, {
        name: name.trim(),
        section,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update habit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
            <DialogDescription>Make changes to your habit. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-section" className="text-right">
                Section
              </Label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger className="col-span-3" id="edit-section">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Body and Mind">Body and Mind</SelectItem>
                  <SelectItem value="Knowledge and Learning">Knowledge and Learning</SelectItem>
                  <SelectItem value="Misc">Misc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
