"use client"

import { useState, useEffect } from "react"
import type { Budget } from "@/lib/firebase"

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])

  // Load budgets from localStorage on mount
  useEffect(() => {
    const savedBudgets = localStorage.getItem("budgets")
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets))
    }
  }, [])

  // Save budgets to localStorage whenever budgets change
  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets))
  }, [budgets])

  const addBudget = (budgetData: Omit<Budget, "id" | "createdAt">) => {
    // Check if budget for this category and period already exists
    const existingBudget = budgets.find(
      (budget) => budget.category === budgetData.category && budget.period === budgetData.period,
    )

    if (existingBudget) {
      // Update existing budget
      setBudgets((prev) =>
        prev.map((budget) => (budget.id === existingBudget.id ? { ...budget, amount: budgetData.amount } : budget)),
      )
    } else {
      // Add new budget
      const newBudget: Budget = {
        ...budgetData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      setBudgets((prev) => [newBudget, ...prev])
    }
  }

  const updateBudget = (id: string, budgetData: Omit<Budget, "id" | "createdAt">) => {
    setBudgets((prev) => prev.map((budget) => (budget.id === id ? { ...budget, ...budgetData } : budget)))
  }

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((budget) => budget.id !== id))
  }

  return {
    budgets,
    addBudget,
    updateBudget,
    deleteBudget,
  }
}
