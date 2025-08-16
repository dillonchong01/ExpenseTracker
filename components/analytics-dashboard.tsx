"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip } from "@/components/ui/chart"
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts"
import type { Expense, Budget } from "@/lib/firebase"
import { PieChartIcon, TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react"

interface AnalyticsDashboardProps {
  expenses: Expense[]
  budgets: Budget[]
}

export function AnalyticsDashboard({ expenses, budgets }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentMonthExpenses = expenses.filter((expense) => expense.date.startsWith(currentMonth))

    // Category breakdown - using current month expenses only
    const categoryTotals = currentMonthExpenses.reduce(
      (acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1),
    }))

    // Budget vs Actual - already using current month
    const budgetComparison = budgets
      .filter((budget) => budget.period === "monthly")
      .map((budget) => {
        const spent = currentMonthExpenses
          .filter((expense) => expense.category === budget.category)
          .reduce((sum, expense) => sum + expense.amount, 0)

        return {
          category: budget.category,
          budget: budget.amount,
          spent,
          remaining: Math.max(budget.amount - spent, 0),
          overBudget: Math.max(spent - budget.amount, 0),
        }
      })

    const totalSpent = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

    // Daily average for current month
    const daysInMonth = new Date().getDate()
    const dailyAverage = totalSpent / daysInMonth

    return {
      categoryData,
      budgetComparison,
      totalSpent,
      totalBudget,
      dailyAverage,
      expenseCount: currentMonthExpenses.length,
    }
  }, [expenses, budgets])

  const categoryColors = [
    "#6B9AC4", // Primary blue
    "#A7C7E7", // Light blue
    "#CADBEB", // Lighter blue
    "#8BB3D3", // Medium blue
    "#5A8AB0", // Darker blue
    "#9BC4E2", // Soft blue
    "#7BA8C7", // Muted blue
  ]

  if (expenses.length === 0) {
    return (
      <div className="mx-auto py-6 pb-20 md:pb-6" style={{ width: "90%" }}>
        <Card className="bg-[#A7C7E7]/5 border-[#A7C7E7]/20">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-[#CADBEB] mb-4" />
            <h3 className="text-lg font-medium text-[#6B9AC4] mb-2">No data to analyze</h3>
            <p className="text-muted-foreground">Add some expenses to see your monthly analytics.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto py-6 pb-20 md:pb-6 space-y-6" style={{ width: "90%" }}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#6B9AC4]/10 border-[#6B9AC4]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#6B9AC4]" />
              <div>
                <p className="text-xs text-muted-foreground">This Month</p>
                <p className="text-lg font-semibold text-[#6B9AC4]">${analytics.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#A7C7E7]/10 border-[#A7C7E7]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#6B9AC4]" />
              <div>
                <p className="text-xs text-muted-foreground">Daily Avg</p>
                <p className="text-lg font-semibold text-[#6B9AC4]">${analytics.dailyAverage.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#CADBEB]/20 border-[#CADBEB]/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#6B9AC4]" />
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-lg font-semibold text-[#6B9AC4]">{analytics.expenseCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#A7C7E7]/10 border-[#A7C7E7]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[#6B9AC4]" />
              <div>
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="text-lg font-semibold text-[#6B9AC4]">{analytics.categoryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Pie Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#6B9AC4]">
            <PieChartIcon className="h-5 w-5" />
            Monthly Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius="45%"
                  fill="#6B9AC4"
                  dataKey="amount"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, category }) => {
                    const RADIAN = Math.PI / 180
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.2
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text x={x} y={y} fill="#6B9AC4" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>
                        {`${category} (${percent.toFixed(1)}%)`}
                      </text>
                    )
                  }}
                  labelLine={true}
                >
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.category}</p>
                          <p className="text-[#6B9AC4]">
                            ${data.amount.toFixed(2)} ({data.percentage}%)
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget vs Actual */}
      {analytics.budgetComparison.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#6B9AC4]">
              <BarChart3 className="h-5 w-5" />
              Budget vs Actual (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.budgetComparison} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CADBEB" />
                  <XAxis dataKey="category" tick={{ fill: "#6B9AC4", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6B9AC4", fontSize: 12 }} width={30}/>
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-[#6B9AC4]">Budget: ${data.budget.toFixed(2)}</p>
                            <p className="text-green-600">Spent: ${data.spent.toFixed(2)}</p>
                            {data.overBudget > 0 && <p className="text-red-600">Over: ${data.overBudget.toFixed(2)}</p>}
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="budget" fill="#CADBEB" name="Budget" />
                  <Bar dataKey="spent" fill="#6B9AC4" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-[#6B9AC4]">Monthly Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.categoryData
              .sort((a, b) => b.amount - a.amount)
              .map((category, index) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#A7C7E7]/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                    />
                    <span className="font-medium">{category.category}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.percentage}%
                    </Badge>
                  </div>
                  <span className="font-semibold text-[#6B9AC4]">${category.amount.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}