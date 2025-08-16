"use client"

import { useState, useEffect } from "react"
import type { Expense } from "@/lib/firebase"

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Load expenses from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }
  }, [])

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  const addExpense = (expenseData: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setExpenses((prev) => [newExpense, ...prev])
  }

  const updateExpense = (id: string, expenseData: Omit<Expense, "id" | "createdAt">) => {
    setExpenses((prev) => prev.map((expense) => (expense.id === id ? { ...expense, ...expenseData } : expense)))
  }

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
  }
}
