export interface Habit {
  id: string
  name: string
  section: string
  completedDates: string[] // Array of dates in format "YYYY-MM-DD"
  createdAt: string
}

export interface HabitFormData {
  name: string
  section: string
}
