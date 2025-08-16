"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
    const weeks = []
    const now = new Date()

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - i * 7)
      const dayOfWeek = weekStart.getDay()
      const daysToMonday = (dayOfWeek + 6) % 7
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
    <div className="mx-auto py-6 pb-20 md:pb-6 space-y-6" style={{ width: "90%" }}>
      {/* 8-Week Spending Trend */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle>8-Week Spending Trend</CardTitle>
              <CardDescription>Weekly Spending over Last 8 Weeks</CardDescription>
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
          <div className="w-full px-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CADBEB" />
                <XAxis dataKey="week" tick={{ fill: "#6B9AC4", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B9AC4", fontSize: 12 }} width={30} />
                <Bar dataKey="totalSpent" fill="#A7C7E7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 6-Month Spending Trend */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div>
              <CardTitle>6-Month Spending Trend</CardTitle>
              <CardDescription>Historical Spending over Last 6 Months</CardDescription>
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
          <div className="w-full px-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sixMonthTrends} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#CADBEB" />
                <XAxis dataKey="month" tick={{ fill: "#6B9AC4", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B9AC4", fontSize: 12 }} width={30} />
                <Bar dataKey="totalSpent" fill="#6B9AC4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}