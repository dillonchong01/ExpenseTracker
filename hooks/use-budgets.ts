// hooks/use-budgets.ts
"use client"

import { useEffect, useState } from "react"
import type { Budget } from "@/lib/firebase"
import { db, waitForAuth } from "@/lib/firebase"
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"

type NewBudget = Omit<Budget, "id"|"createdAt"|"updatedAt"|"userId">

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])

  useEffect(() => {
    let unsub: (() => void)|undefined
    ;(async () => {
      const user = await waitForAuth(); if (!user) { setBudgets([]); return }
      const q = query(collection(db,"budgets"), where("userId","==",user.uid), orderBy("createdAt","desc"))
      unsub = onSnapshot(q, snap => {
        setBudgets(snap.docs.map(d => {
          const data = d.data() as any
          return {
            id: d.id,
            category: data.category,
            amount: Number(data.amount ?? data.limit ?? 0),
            period: data.period ?? "Monthly",
            createdAt: data.createdAt?.toMillis?.() ?? data.createdAt ?? Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() ?? data.updatedAt,
            userId: data.userId,
          }
        }))
      })
    })()
    return () => { if (unsub) unsub() }
  }, [])

  async function addBudget(budget: NewBudget) {
    const user = await waitForAuth(); if (!user) throw new Error("Not signed in")
    await addDoc(collection(db,"budgets"), { ...budget, amount: Number(budget.amount ?? 0), userId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }

  async function updateBudget(id: string, patch: Partial<NewBudget>) {
    await updateDoc(doc(db,"budgets",id), { ...patch, amount: patch.amount===undefined?undefined:Number(patch.amount), updatedAt: serverTimestamp() } as any)
  }

  async function deleteBudget(id: string) { await deleteDoc(doc(db,"budgets",id)) }

  return { budgets, addBudget, updateBudget, deleteBudget }
}
