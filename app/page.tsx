"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, subDays, addWeeks, subWeeks } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { HabitList } from "@/components/habit-list"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { StatsView } from "@/components/stats-view"
import { useHabits } from "@/hooks/use-habits"
import { useAuth } from "@/contexts/auth-context"
import type { HabitFormData } from "@/types/habit"

export default function HabitTracker() {
  const [date, setDate] = useState<Date>(new Date())
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const { habits, loading, toggleHabit, addHabit, removeHabit, updateHabit } = useHabits()
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handlePrevDay = () => setDate(subDays(date, 1))
  const handleNextDay = () => setDate(addDays(date, 1))
  const handlePrevWeek = () => setDate(subWeeks(date, 1))
  const handleNextWeek = () => setDate(addWeeks(date, 1))

  const handleAddHabit = async (habitData: HabitFormData) => {
    return await addHabit(habitData)
  }

  // If still loading auth or user is not authenticated, show loading state
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="h-8 w-48 bg-white/50 rounded animate-pulse mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-white/50 rounded animate-pulse mb-8 mx-auto"></div>

          <div className="bg-white/50 rounded-lg p-4 h-12 mb-6 animate-pulse"></div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 rounded-lg p-6 h-40 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Habit Tracker</h1>
          <p className="text-gray-600">Track your daily habits and build consistency</p>
        </header>

        <Tabs defaultValue="tracker" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="tracker">Tracker</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <Button onClick={() => setIsAddHabitOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>

          <TabsContent value="tracker" className="space-y-4">
            <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
              <Button variant="outline" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[240px] justify-center text-center font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((section) => (
                    <div key={section} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b">
                        <Skeleton className="h-6 w-40" />
                      </div>
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="h-5 w-5 rounded-md" />
                              <Skeleton className="h-5 w-40" />
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <HabitList
                  habits={habits}
                  date={date}
                  onToggle={toggleHabit}
                  onRemove={removeHabit}
                  onUpdate={updateHabit}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {loading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="bg-white rounded-lg border p-4">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <StatsView habits={habits} />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AddHabitDialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen} onAddHabit={handleAddHabit} />
      </div>
    </div>
  )
}
