// hooks/useAuth.ts
"use client"
import { useEffect, useState } from "react"
import { auth, AuthAPI } from "@/lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<User|null>(null), [loading, setLoading] = useState(true)
  useEffect(() => { const u = onAuthStateChanged(auth, x => { setUser(x); setLoading(false) }); return () => u() }, [])
  return { user, loading, signInGoogle: AuthAPI.signInGoogle, signInEmail: AuthAPI.signInEmail, signUpEmail: AuthAPI.signUpEmail, signOut: AuthAPI.signOut }
}
