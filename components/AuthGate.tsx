"use client"
import { ReactNode, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter, usePathname } from "next/navigation"

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, signInGoogle } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Redirect signed-in users away from /sign-in
  useEffect(() => {
    if (!loading && user && pathname === "/sign-in") router.replace("/")
  }, [user, loading, pathname, router])

  if (loading) return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(99,102,241,.25),transparent),radial-gradient(1200px_600px_at_110%_10%,rgba(16,185,129,.25),transparent)]">
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-80 h-36 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl shadow-[0_8px_40px_-12px_rgba(0,0,0,.3)] border border-white/20 animate-pulse" />
      </div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(1200px_600px_at_-10%_-10%,rgba(99,102,241,.25),transparent),radial-gradient(1200px_600px_at_110%_10%,rgba(16,185,129,.25),transparent)]" suppressHydrationWarning>
      <div className="absolute inset-0 -z-10 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.08)_0deg,transparent_60deg,transparent_300deg,rgba(255,255,255,.08)_360deg)] [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 dark:bg-black/30 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,.45)]" suppressHydrationWarning>
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 shadow-inner flex items-center justify-center text-white font-semibold">€</div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Welcome Back to ExpenseTracker!</h1>
                <p className="text-sm text-black/60 dark:text-white/60">Sign in to continue tracking</p>
              </div>
            </div>

            {/* Google button */}
            <button onClick={()=>signInGoogle()} className="cursor-pointer group w-full inline-flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-white/30 bg-white/80 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/15 active:scale-[.99] transition-all shadow-[inset_0_-2px_0_rgba(0,0,0,.06)]" suppressHydrationWarning aria-label="Continue with Google">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.951,3.049l5.657-5.657C33.64,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.818C14.4,16.104,18.869,13,24,13c3.059,0,5.842,1.154,7.951,3.049l5.657-5.657 C33.64,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c4.989,0,9.55-1.917,13.018-5.053l-6.005-4.934C29.015,35.705,26.683,36.5,24,36.5 c-5.196,0-9.607-3.317-11.268-7.943l-6.49,5.002C9.55,39.915,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.088,5.614 c0.001-0.001,0.002-0.001,0.003-0.002l6.005,4.934C36.97,39.021,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
              <span className="font-medium">Continue with Google</span>
              <span className="ml-auto text-xs text-black/50 dark:text-white/50 pr-1 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="text-[11px] uppercase tracking-wider text-black/50 dark:text-white/50">or</span>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>

            {/* Email link */}
            <a href="/sign-in" className="cursor-pointer block text-center h-11 leading-[44px] rounded-xl bg-gradient-to-br from-indigo-500/90 to-emerald-500/90 text-white font-medium shadow-[0_12px_30px_-12px_rgba(99,102,241,.6)] hover:shadow-[0_16px_36px_-12px_rgba(16,185,129,.55)] transition-shadow" suppressHydrationWarning>
              Sign In with Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )

  return <>{children}</>
}