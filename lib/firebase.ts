// lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
export function waitForAuth(): Promise<User|null> { return new Promise(res => { const u = onAuthStateChanged(auth, x => { u(); res(x) }) }) }
export const AuthAPI = {
  signInGoogle: () => signInWithPopup(auth, googleProvider),
  signInEmail: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  signUpEmail: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
  signOut: () => signOut(auth),
}

// Domain types
export interface Expense { id: string; itemName: string; category: string; amount: number; date: string; createdAt: string|number; updatedAt?: string|number; budgetId?: string|null; userId?: string }
export interface Budget { id: string; category: string; amount: number; period: "Weekly"|"Monthly"|"Yearly"|"Custom"; createdAt: string|number; updatedAt?: string|number; userId?: string }

// Auto-categorization
export const categoryKeywords: Record<string, string[]> = {
  "Food & Dining": ["restaurant","food","grocery","coffee","lunch","dinner","breakfast"],
  Transportation: ["gas","uber","taxi","bus","train","parking","fuel"],
  Shopping: ["amazon","store","mall","clothes","shoes","electronics"],
  Entertainment: ["movie","netflix","spotify","game","concert","theater"],
  "Bills & Utilities": ["electric","water","internet","phone","rent","mortgage"],
  Healthcare: ["doctor","pharmacy","hospital","medicine","dental"],
  Other: [],
}
export const categorizeExpense = (itemName: string): string => { const s = itemName.toLowerCase(); for (const [cat, kws] of Object.entries(categoryKeywords)) { if (kws.some(k => s.includes(k))) return cat } return "Other" }
