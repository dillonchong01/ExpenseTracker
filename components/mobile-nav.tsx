"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlusCircle, PieChart, Target, TrendingUp, Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { signOut } = useAuth()

  const tabs = [
    { id: "expenses", label: "Expenses", icon: PlusCircle },
    { id: "budgets", label: "Budgets", icon: Target },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "trends", label: "Trends", icon: TrendingUp },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/sign-in"
    } catch (err) {
      console.error(err)
    } finally {
      setIsMenuOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 glass-card border-b border-white/30">
        <div className="w-4/5 mx-auto py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading text-primary drop-shadow-sm">ExpenseTracker</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden hover:bg-primary/10 transition-all duration-200"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
          <Card className="absolute top-20 left-4 right-4 p-6 glass-card modern-shadow border-white/30 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className={`flex flex-col gap-2 h-auto py-4 font-body min-w-0 transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "hover:bg-primary/10 hover:scale-102"
                    }`}
                    onClick={() => {
                      onTabChange(tab.id)
                      setIsMenuOpen(false)
                    }}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium truncate">{tab.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* Sign out button in mobile overlay */}
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 py-3 font-body hover:bg-primary/10 transition"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign out</span>
            </Button>
          </Card>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/30 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                className={`flex flex-col gap-1 h-auto py-3 px-4 font-body min-w-0 transition-all duration-200 ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </Button>
            )
          })}

          {/* Sign out button in bottom nav */}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3 px-4 font-body min-w-0 hover:bg-primary/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium truncate">Sign out</span>
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-72 glass-card border-r border-white/30 modern-shadow">
        <div className="p-8 flex flex-col h-full">
          <h1 className="text-3xl font-heading text-primary mb-10 drop-shadow-sm">ExpenseTracker</h1>
          <nav className="space-y-3 flex-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-4 py-3 px-4 font-body transition-all duration-200 min-w-0 ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "hover:bg-primary/10 hover:scale-102"
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium truncate">{tab.label}</span>
                </Button>
              )
            })}
          </nav>

          {/* Sign out button in desktop sidebar */}
          <Button
            variant="ghost"
            className="mt-6 w-full flex items-center justify-start gap-3 py-3 px-4 font-body hover:bg-primary/10 transition"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign out</span>
          </Button>
        </div>
      </div>
    </>
  )
}