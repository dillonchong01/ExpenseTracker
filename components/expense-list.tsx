"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Expense } from "@/lib/firebase"
import { Edit3, Trash2, Receipt } from "lucide-react"

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (expenses.length === 0) {
    return (
      <Card className="bg-[#A7C7E7]/5 border-[#A7C7E7]/20">
        <CardContent className="py-12 text-center">
          <Receipt className="h-12 w-12 mx-auto text-[#CADBEB] mb-4" />
          <h3 className="text-lg font-medium text-[#6B9AC4] mb-2">No expenses yet</h3>
          <p className="text-muted-foreground">Add your first expense to get started tracking your spending.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-[#6B9AC4]/10 border-[#6B9AC4]/30 flex items-center h-24">
        <CardHeader className="w-full p-0">
          <CardTitle className="text-[#6B9AC4] text-lg">Total Expenses: ${totalAmount.toFixed(2)}</CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} className="bg-card hover:bg-[#A7C7E7]/5 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-foreground truncate">{expense.itemName}</h3>
                    <Badge variant="outline" className={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    <span className="font-semibold text-[#6B9AC4] text-lg">${expense.amount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    className="h-8 w-8 p-0 hover:bg-[#A7C7E7]/20"
                  >
                    <Edit3 className="h-4 w-4 text-[#6B9AC4]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    className="h-8 w-8 p-0 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
