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
    <form onSubmit={handleSubmit} className="w-full">
      <Card className="w-full bg-[#A7C7E7]/80 border-[#A7C7E7]/80">
        <CardHeader className="py-4">
          <CardTitle className="flex items-center gap-2 text-[#6B9AC4] m-0">
            {editingBudget ? <Edit3 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
            {editingBudget ? "Edit Budget" : "Set New Budget"}
          </CardTitle>
        </CardHeader>

        <CardContent className="w-full space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="w-full border-[#CADBEB] focus:border-[#6B9AC4]">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(categoryKeywords).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border-[#CADBEB] focus:border-[#6B9AC4]"
              required
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Period</Label>
            <Select value={period} onValueChange={(value: "Weekly" | "Monthly") => setPeriod(value)}>
              <SelectTrigger className="w-full border-[#CADBEB] focus:border-[#6B9AC4]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-[#6B9AC4] hover:bg-[#6B9AC4]/90">
              {editingBudget ? "Update Budget" : "Set Budget"}
            </Button>
            {editingBudget && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="border-[#CADBEB] bg-transparent"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  )
}