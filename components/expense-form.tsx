"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categorizeExpense, categoryKeywords, type Expense } from "@/lib/firebase"
import { PlusCircle, Edit3 } from "lucide-react"

interface ExpenseFormProps {
  onSubmit: (expense: Omit<Expense, "id" | "createdAt">) => void
  editingExpense?: Expense | null
  onCancelEdit?: () => void
}

export function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }: ExpenseFormProps) {
  const [itemName, setItemName] = useState(editingExpense?.itemName || "")
  const [category, setCategory] = useState(editingExpense?.category || "")
  const [amount, setAmount] = useState(editingExpense?.amount?.toString() || "")
  const [date, setDate] = useState(editingExpense?.date || new Date().toISOString().split("T")[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName || !amount || !date) return

    const finalCategory = category || categorizeExpense(itemName)

    onSubmit({
      itemName,
      category: finalCategory,
      amount: Number.parseFloat(amount),
      date,
    })

    // Reset form if not editing
    if (!editingExpense) {
      setItemName("")
      setCategory("")
      setAmount("")
      setDate(new Date().toISOString().split("T")[0])
    }
  }

  const handleItemNameChange = (value: string) => {
    setItemName(value)
    // Auto-suggest category if not manually set
    if (!category && value) {
      const suggestedCategory = categorizeExpense(value)
      if (suggestedCategory !== "Other") {
        setCategory(suggestedCategory)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {editingBudget ? <Edit3 className="h-6 w-6 text-primary" /> : <Target className="h-6 w-6 text-primary" />}
        <h2 className="text-2xl font-heading text-foreground">
          {editingBudget ? "Edit Budget" : "Set New Budget"}
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-body font-medium text-foreground">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="w-full bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {Object.keys(categoryKeywords).map((cat) => (
                <SelectItem key={cat} value={cat} className="font-body">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-body font-medium text-foreground">
            Budget Amount ($)
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body"
            required
          />
        </div>

        {/* Period */}
        <div className="space-y-2">
          <Label htmlFor="period" className="text-sm font-body font-medium text-foreground">
            Period
          </Label>
          <Select value={period} onValueChange={(value: "Weekly" | "Monthly") => setPeriod(value)}>
            <SelectTrigger className="w-full bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {editingBudget ? "Update Budget" : "Set Budget"}
          </Button>
          {editingBudget && onCancelEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              className="border-border bg-secondary hover:bg-secondary/80 text-secondary-foreground font-body font-medium transition-all duration-200"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}