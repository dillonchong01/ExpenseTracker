"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Budget, Expense } from "@/lib/firebase"
import { Edit3, Trash2, Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface BudgetListProps {
  budgets: Budget[]
  expenses: Expense[]
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetList({ budgets, expenses, onEdit, onDelete }: BudgetListProps) {
  const calculateSpending = (budget: Budget) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let startDate: Date
    if (budget.period === "weekly") {
      // Get start of current week (Sunday)
      const dayOfWeek = now.getDay()
      startDate = new Date(now)
      startDate.setDate(now.getDate() - dayOfWeek)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // Get start of current month
      startDate = new Date(currentYear, currentMonth, 1)
    }

    const relevantExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expense.category === budget.category && expenseDate >= startDate && expenseDate <= now
    })

    return relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const getBudgetStatus = (spent: number, budgetAmount: number) => {
    const percentage = (spent / budgetAmount) * 100
    if (percentage >= 100) return { status: "over", color: "text-red-600", icon: AlertTriangle }
    if (percentage >= 80) return { status: "warning", color: "text-orange-600", icon: TrendingUp }
    return { status: "good", color: "text-green-600", icon: TrendingDown }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Food & Dining": "bg-orange-100 text-orange-800 border-orange-200",
      Transportation: "bg-blue-100 text-blue-800 border-blue-200",
      Shopping: "bg-purple-100 text-purple-800 border-purple-200",
      Entertainment: "bg-pink-100 text-pink-800 border-pink-200",
      "Bills & Utilities": "bg-red-100 text-red-800 border-red-200",
      Healthcare: "bg-green-100 text-green-800 border-green-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[category] || colors.Other
  }

  if (budgets.length === 0) {
    return (
      <Card className="bg-[#A7C7E7]/5 border-[#A7C7E7]/20 w-full" style={{ maxWidth: "90%", margin: "0 auto" }}>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto text-[#CADBEB] mb-4" />
          <h3 className="text-lg font-medium text-[#6B9AC4] mb-2">No budgets set</h3>
          <p className="text-muted-foreground">Create your first budget to start tracking your spending goals.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 mx-auto" style={{ width: "90%" }}>
      <Card className="bg-[#6B9AC4]/10 border-[#6B9AC4]/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#6B9AC4] text-lg">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""} active
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {budgets.map((budget) => {
          const spent = calculateSpending(budget)
          const percentage = Math.min((spent / budget.amount) * 100, 100)
          const remaining = Math.max(budget.amount - spent, 0)
          const { status, color, icon: StatusIcon } = getBudgetStatus(spent, budget.amount)

          return (
            <Card key={budget.id} className="bg-card hover:bg-[#A7C7E7]/5 transition-colors">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={getCategoryColor(budget.category)}>
                          {budget.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {budget.period}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`h-4 w-4 ${color}`} />
                        <span className="text-sm font-medium">
                          ${spent.toFixed(2)} of ${budget.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(budget)}
                        className="h-8 w-8 p-0 hover:bg-[#A7C7E7]/20"
                      >
                        <Edit3 className="h-4 w-4 text-[#6B9AC4]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(budget.id)}
                        className="h-8 w-8 p-0 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className={`font-medium ${color}`}>{percentage.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-2"
                      style={{
                        background: "#CADBEB",
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spent: ${spent.toFixed(2)}</span>
                      <span>
                        {status === "over" ? "Over by" : "Remaining"}: $
                        {status === "over" ? (spent - budget.amount).toFixed(2) : remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
