<form
  onSubmit={handleSubmit}
  className="space-y-4 w-full max-w-md mx-auto bg-[#A7C7E7]/10 border-[#A7C7E7]/30 p-4 rounded-md"
>
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-[#6B9AC4] text-lg font-medium">
      {editingBudget ? <Edit3 className="h-5 w-5" /> : <Target className="h-5 w-5" />}
      {editingBudget ? "Edit Budget" : "Set New Budget"}
    </div>

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

    {/* Budget Amount */}
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
    <div className="flex gap-2 pt-2">
      <Button type="submit" className="flex-1 bg-[#6B9AC4] hover:bg-[#6B9AC4]/90">
        {editingBudget ? "Update Budget" : "Set Budget"}
      </Button>
      {editingBudget && onCancelEdit && (
        <Button type="button" variant="outline" onClick={onCancelEdit} className="border-[#CADBEB] bg-transparent">
          Cancel
        </Button>
      )}
    </div>
  </div>
</form>