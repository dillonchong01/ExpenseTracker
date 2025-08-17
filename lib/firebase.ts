// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
}

// Placeholder for Firebase imports - will be replaced when user provides config
export const db = null
export const auth = null

// Types for our expense management system
export interface Expense {
  id: string
  itemName: string
  category: string
  amount: number
  date: string
  createdAt: string
}

export interface Budget {
  id: string
  category: string
  amount: number
  period: "Weekly" | "Monthly"
  createdAt: string
}

// Auto-categorization keywords
export const categoryKeywords = {
  "Food & Dining": ["restaurant", "food", "grocery", "coffee", "lunch", "dinner", "breakfast"],
  Transportation: ["gas", "uber", "taxi", "bus", "train", "parking", "fuel"],
  Shopping: ["amazon", "store", "mall", "clothes", "shoes", "electronics"],
  Entertainment: ["movie", "netflix", "spotify", "game", "concert", "theater"],
  "Bills & Utilities": ["electric", "water", "internet", "phone", "rent", "mortgage"],
  Healthcare: ["doctor", "pharmacy", "hospital", "medicine", "dental"],
  Other: [],
}

export const categorizeExpense = (itemName: string): string => {
  const lowerName = itemName.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => lowerName.includes(keyword))) {
      return category
    }
  }

  return "Other"
}
