"use client"

import { useState } from "react"
import { MobileNav } from "@/components/mobile-nav"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { BudgetForm } from "@/components/budget-form"
import { BudgetList } from "@/components/budget-list"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { TrendsDashboard } from "@/components/trends-dashboard"
import { useExpenses } from "@/hooks/use-expenses"
import { useBudgets } from "@/hooks/use-budgets"
import type { Expense, Budget } from "@/lib/firebase"

export default function ExpenseManager() {
  const [activeTab, setActiveTab] = useState("expenses")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets()

  const handleSubmitExpense = (expenseData: Omit<Expense, "id" | "createdAt">) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData)
      setEditingExpense(null)
    } else {
      addExpense(expenseData)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
  }

  const handleCancelEditExpense = () => {
    setEditingExpense(null)
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id)
      if (editingExpense?.id === id) {
        setEditingExpense(null)
      }
    }
  }

  const handleSubmitBudget = (budgetData: Omit<Budget, "id" | "createdAt">) => {
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetData)
      setEditingBudget(null)
    } else {
      addBudget(budgetData)
    }
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
  }

  const handleCancelEditBudget = () => {
    setEditingBudget(null)
  }

  const handleDeleteBudget = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudget(id)
      if (editingBudget?.id === id) {
        setEditingBudget(null)
      }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "expenses":
        return (
          <div className="w-4/5 mx-auto py-8 pb-24 md:pb-8 space-y-8">
            <div className="glass-card p-6 modern-shadow rounded-xl border-white/30">
              <ExpenseForm
                onSubmit={handleSubmitExpense}
                editingExpense={editingExpense}
                onCancelEdit={handleCancelEditExpense}
              />
            </div>
            <div className="glass-card p-6 modern-shadow rounded-xl border-white/30">
              <ExpenseList expenses={expenses} onEdit={handleEditExpense} onDelete={handleDeleteExpense} />
            </div>
          </div>
        )
      case "budgets":
        return (
          <div className="w-4/5 mx-auto py-8 pb-24 md:pb-8 space-y-8">
            <div className="glass-card p-6 modern-shadow rounded-xl border-white/30">
              <BudgetForm
                onSubmit={handleSubmitBudget}
                editingBudget={editingBudget}
                onCancelEdit={handleCancelEditBudget}
              />
            </div>
            <div className="glass-card p-6 modern-shadow rounded-xl border-white/30">
              <BudgetList
                budgets={budgets}
                expenses={expenses}
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
              />
            </div>
          </div>
        )
      case "analytics":
        return <AnalyticsDashboard expenses={expenses} budgets={budgets} />
      case "trends":
        return <TrendsDashboard expenses={expenses} budgets={budgets} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="md:ml-72">{renderContent()}</main>
    </div>
  )
}
