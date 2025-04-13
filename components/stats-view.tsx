"use client"

import { useMemo } from "react"
import { format, subDays } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "@/types/habit"

interface StatsViewProps {
  habits: Habit[]
}

export function StatsView({ habits }: StatsViewProps) {
  const today = new Date()

  // Calculate streak for each habit
  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      // Sort completed dates
      const sortedDates = [...habit.completedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

      // Calculate current streak
      let currentStreak = 0
      let date = today

      while (true) {
        const dateStr = format(date, "yyyy-MM-dd")
        if (habit.completedDates.includes(dateStr)) {
          currentStreak++
          date = subDays(date, 1)
        } else {
          break
        }
      }

      // Calculate completion rate for last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(today, i)
        return format(date, "yyyy-MM-dd")
      })

      const completedInLast30Days = last30Days.filter((date) => habit.completedDates.includes(date)).length

      const completionRate = (completedInLast30Days / 30) * 100

      return {
        id: habit.id,
        name: habit.name,
        section: habit.section,
        currentStreak,
        completionRate: Math.round(completionRate),
        totalCompletions: habit.completedDates.length,
      }
    })
  }, [habits, today])

  // Data for completion rate chart
  const completionRateData = useMemo(() => {
    return habitStats.map((stat) => ({
      name: stat.name.length > 15 ? `${stat.name.substring(0, 15)}...` : stat.name,
      completionRate: stat.completionRate,
    }))
  }, [habitStats])

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalHabits = habits.length
    const totalCompletions = habitStats.reduce((sum, stat) => sum + stat.totalCompletions, 0)
    const avgCompletionRate =
      totalHabits > 0 ? Math.round(habitStats.reduce((sum, stat) => sum + stat.completionRate, 0) / totalHabits) : 0
    const longestStreak = Math.max(...habitStats.map((stat) => stat.currentStreak), 0)

    return {
      totalHabits,
      totalCompletions,
      avgCompletionRate,
      longestStreak,
    }
  }, [habits, habitStats])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Habits</CardDescription>
            <CardTitle className="text-3xl">{overallStats.totalHabits}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Completions</CardDescription>
            <CardTitle className="text-3xl">{overallStats.totalCompletions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Completion Rate</CardDescription>
            <CardTitle className="text-3xl">{overallStats.avgCompletionRate}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Longest Streak</CardDescription>
            <CardTitle className="text-3xl">{overallStats.longestStreak} days</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rate (Last 30 Days)</CardTitle>
          <CardDescription>Percentage of days each habit was completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {completionRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionRateData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis label={{ value: "Completion %", angle: -90, position: "insideLeft" }} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="completionRate" name="Completion Rate">
                    {completionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${(index * 30) % 360}, 70%, 80%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No habit data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Streaks</CardTitle>
          <CardDescription>Number of consecutive days each habit was completed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {habitStats.length > 0 ? (
              habitStats.map((stat) => (
                <div key={stat.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{stat.name}</p>
                    <p className="text-sm text-gray-500">{stat.section}</p>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="bg-gradient-to-r from-pink-200 to-purple-200 h-8 rounded-md"
                      style={{ width: `${Math.min(stat.currentStreak * 10, 200)}px` }}
                    />
                    <span className="ml-3 font-medium">{stat.currentStreak} days</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No habit data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
