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
      <div className="flex items-center gap-3 mb-6">
        {editingExpense ? <Edit3 className="h-6 w-6 text-primary" /> : <PlusCircle className="h-6 w-6 text-primary" />}
        <h2 className="text-2xl font-heading text-foreground">{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="itemName" className="text-sm font-body font-medium text-foreground">
            Item Name
          </Label>
          <Input
            id="itemName"
            value={itemName}
            onChange={(e) => handleItemNameChange(e.target.value)}
            placeholder="e.g., Coffee at Starbucks"
            className="bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="category" className="text-sm font-body font-medium text-foreground">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body">
              <SelectValue placeholder="Auto-categorized" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-sm font-body font-medium text-foreground">
              Amount ($)
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="date" className="text-sm font-body font-medium text-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border-border focus:border-primary focus:ring-ring transition-all duration-200 font-body"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {editingExpense ? "Update Expense" : "Add Expense"}
          </Button>
          {editingExpense && onCancelEdit && (
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
