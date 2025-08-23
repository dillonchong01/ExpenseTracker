// hooks/use-expenses.ts
"use client"

import { useEffect, useState } from "react"
import type { Expense } from "@/lib/firebase"
import { db, waitForAuth } from "@/lib/firebase"
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"

type NewExpense = Omit<Expense, "id"|"createdAt"|"updatedAt"|"userId">

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    let unsub: (() => void)|undefined
    ;(async () => {
      const user = await waitForAuth(); if (!user) { setExpenses([]); return }
      const q = query(collection(db,"expenses"), where("userId","==",user.uid), orderBy("date","desc"))
      unsub = onSnapshot(q, snap => {
        setExpenses(snap.docs.map(d => {
          const data = d.data() as any
          return {
            id: d.id,
            itemName: data.itemName,
            category: data.category,
            amount: Number(data.amount ?? 0),
            date: data.date,
            budgetId: data.budgetId ?? null,
            createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
            userId: data.userId,
          }
        }))
      })
    })()
    return () => { if (unsub) unsub() }
  }, [])

  async function addExpense(expense: NewExpense) {
    const user = await waitForAuth(); if (!user) throw new Error("Not signed in")
    await addDoc(collection(db,"expenses"), { ...expense, amount: Number(expense.amount ?? 0), userId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }

  async function updateExpense(id: string, patch: Partial<NewExpense>) {
    await updateDoc(doc(db,"expenses",id), { ...patch, amount: patch.amount===undefined?undefined:Number(patch.amount), updatedAt: serverTimestamp() } as any)
  }

  async function deleteExpense(id: string) { await deleteDoc(doc(db,"expenses",id)) }

  return { expenses, addExpense, updateExpense, deleteExpense }
}
