"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import type { Habit } from "@/types/habit"

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load habits from Supabase on initial render or when user changes
  useEffect(() => {
    async function fetchHabits() {
      if (!user) {
        setHabits([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch habits for the current user
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (habitsError) throw habitsError

        // Fetch completions for all habits
        const { data: completionsData, error: completionsError } = await supabase
          .from("habit_completions")
          .select("habit_id, completed_date")
          .eq("user_id", user.id)

        if (completionsError) throw completionsError

        // Map completions to their respective habits
        const habitsWithCompletions = habitsData.map((habit) => {
          const habitCompletions = completionsData
            .filter((completion) => completion.habit_id === habit.id)
            .map((completion) => format(new Date(completion.completed_date), "yyyy-MM-dd"))

          return {
            id: habit.id,
            name: habit.name,
            section: habit.section,
            completedDates: habitCompletions,
            createdAt: habit.created_at,
          }
        })

        setHabits(habitsWithCompletions)
      } catch (error) {
        console.error("Error fetching habits:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHabits()
  }, [user])

  // Toggle habit completion for a specific date
  const toggleHabit = async (habitId: string, dateStr: string) => {
    if (!user) return

    try {
      const habit = habits.find((h) => h.id === habitId)
      if (!habit) return

      const isCompleted = habit.completedDates.includes(dateStr)

      if (isCompleted) {
        // Delete the completion record
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("completed_date", dateStr)
          .eq("user_id", user.id)

        if (error) throw error

        // Update local state
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.id === habitId) {
              return {
                ...h,
                completedDates: h.completedDates.filter((date) => date !== dateStr),
              }
            }
            return h
          }),
        )
      } else {
        // Insert a new completion record
        const { error } = await supabase.from("habit_completions").insert({
          habit_id: habitId,
          completed_date: dateStr,
          user_id: user.id,
        })

        if (error) throw error

        // Update local state
        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.id === habitId) {
              return {
                ...h,
                completedDates: [...h.completedDates, dateStr],
              }
            }
            return h
          }),
        )
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error)
    }
  }

  // Add a new habit
  const addHabit = async (habit: Omit<Habit, "id" | "createdAt" | "completedDates">) => {
    if (!user) return

    try {
      // Insert the new habit into Supabase
      const { data, error } = await supabase
        .from("habits")
        .insert({
          name: habit.name,
          section: habit.section,
          user_id: user.id,
        })
        .select()

      if (error) throw error

      // Update local state with the new habit
      const newHabit: Habit = {
        id: data[0].id,
        name: data[0].name,
        section: data[0].section,
        completedDates: [],
        createdAt: data[0].created_at,
      }

      setHabits((prevHabits) => [newHabit, ...prevHabits])
      return newHabit
    } catch (error) {
      console.error("Error adding habit:", error)
    }
  }

  // Remove a habit
  const removeHabit = async (habitId: string) => {
    if (!user) return

    try {
      // Delete the habit from Supabase (cascade will delete completions)
      const { error } = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId))
    } catch (error) {
      console.error("Error removing habit:", error)
    }
  }

  // Update a habit
  const updateHabit = async (habitId: string, updatedHabit: Partial<Habit>) => {
    if (!user) return

    try {
      // Update the habit in Supabase
      const { error } = await supabase
        .from("habits")
        .update({
          name: updatedHabit.name,
          section: updatedHabit.section,
        })
        .eq("id", habitId)
        .eq("user_id", user.id)

      if (error) throw error

      // Update local state
      setHabits((prevHabits) =>
        prevHabits.map((habit) => (habit.id === habitId ? { ...habit, ...updatedHabit } : habit)),
      )
    } catch (error) {
      console.error("Error updating habit:", error)
    }
  }

  return {
    habits,
    loading,
    toggleHabit,
    addHabit,
    removeHabit,
    updateHabit,
  }
}
