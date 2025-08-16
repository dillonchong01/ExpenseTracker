"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { ResponsiveContainer, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import type { Expense, Budget } from "@/lib/firebase"

interface TrendsDashboardProps {
  expenses: Expense[]
  budgets: Budget[]
}

export function TrendsDashboard({ expenses, budgets }: TrendsDashboardProps) {
  const [sixMonthCategory, setSixMonthCategory] = useState<string>("all")
  const [weeklyCategory, setWeeklyCategory] = useState<string>("all")

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(expenses.map((expense) => expense.category))]
    return uniqueCategories.sort()
  }, [expenses])

  const sixMonthTrends = useMemo(() => {
    // Get last 6 months of data
    const now = new Date()
    const months = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const matchesMonth =
          expenseDate.getFullYear() === date.getFullYear() && expenseDate.getMonth() === date.getMonth()
        const matchesCategory = sixMonthCategory === "all" || expense.category === sixMonthCategory
        return matchesMonth && matchesCategory
      })

      const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

      months.push({
        month: monthName,
        totalSpent,
      })
    }

    return months
  }, [expenses, sixMonthCategory])

  const weeklyTrends = useMemo(() => {
    // Get last 8 weeks of data
    const weeks = []
    const now = new Date()

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7)
      const dayOfWeek = weekStart.getDay()
      const daysToMonday = (dayOfWeek + 6) % 7 // Convert to Monday-based week
      weekStart.setDate(weekStart.getDate() - daysToMonday)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)

      const weekExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        const matchesWeek = expenseDate >= weekStart && expenseDate <= weekEnd
        const matchesCategory = weeklyCategory === "all" || expense.category === weeklyCategory
        return matchesWeek && matchesCategory
      })

      const totalSpent = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      const weekLabel = weekStart.toLocaleDateString("en-US", { day: "numeric", month: "short" })

      weeks.push({
        week: weekLabel,
        totalSpent,
      })
    }

    return weeks
  }, [expenses, weeklyCategory])

  return (
    <div className="w-4/5 mx-auto py-6 pb-20 md:pb-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>8-Week Spending Trend</CardTitle>
              <CardDescription>Weekly spending patterns over the last 8 weeks</CardDescription>
            </div>
            <Select value={weeklyCategory} onValueChange={setWeeklyCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full px-4">
            <ChartContainer
              config={{
                totalSpent: {
                  label: "Weekly Spent",
                  color: "#A7C7E7",
                },
              }}
              className="h-[300px] w-full overflow-hidden"
            >
              <ResponsiveContainer width="85%" height="100%">
                <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CADBEB" />
                  <XAxis dataKey="week" stroke="#6B9AC4" />
                  <YAxis stroke="#6B9AC4" width={30} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">Week of {label}</p>
                            <p className="text-[#6B9AC4]">Weekly Spent: ${data.totalSpent.toFixed(2)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="#A7C7E7" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>6-Month Spending Trend</CardTitle>
              <CardDescription>Historical spending patterns over the last 6 months</CardDescription>
            </div>
            <Select value={sixMonthCategory} onValueChange={setSixMonthCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full px-4">
            <ChartContainer
              config={{
                totalSpent: {
                  label: "Total Spent",
                  color: "#6B9AC4",
                },
              }}
              className="h-[300px] w-full overflow-hidden"
            >
              <ResponsiveContainer width="85%" height="100%">
                <BarChart data={sixMonthTrends} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CADBEB" />
                  <XAxis dataKey="month" stroke="#6B9AC4" />
                  <YAxis stroke="#6B9AC4" width={30} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-[#6B9AC4]">Total Spent: ${data.totalSpent.toFixed(2)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="totalSpent" fill="#6B9AC4" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
