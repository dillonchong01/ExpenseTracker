"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categoryKeywords, type Budget } from "@/lib/firebase"
import { Target, Edit3 } from "lucide-react"

interface BudgetFormProps {
  onSubmit: (budget: Omit<Budget, "id" | "createdAt">) => void
  editingBudget?: Budget | null
  onCancelEdit?: () => void
}

export function BudgetForm({ onSubmit, editingBudget, onCancelEdit }: BudgetFormProps) {
  const [category, setCategory] = useState(editingBudget?.category || "")
  const [amount, setAmount] = useState(editingBudget?.amount?.toString() || "")
  const [period, setPeriod] = useState<"Weekly" | "Monthly">(editingBudget?.period || "Monthly")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !amount) return

    onSubmit({
      category,
      amount: Number.parseFloat(amount),
      period,
    })

    if (!editingBudget) {
      setCategory("")
      setAmount("")
      setPeriod("Monthly")
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