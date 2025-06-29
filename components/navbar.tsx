"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GamepadIcon } from "lucide-react"
import { LoginSlidePanel } from "@/components/login-slide-panel"
import { User } from "@/lib/types"

interface NavbarProps {
  user: User| null
  onLogin: (user: User) => void
  onLogout: () => void
  shouldOpenLogin?: boolean
  onLoginPanelClose?: () => void
  onNavigateHome?: () => void
  onNavigateLeaderboard?: () => void
}

export function Navbar({
  user,
  onLogin,
  onLogout,
  shouldOpenLogin = false,
  onLoginPanelClose,
  onNavigateHome,
  onNavigateLeaderboard,
}: NavbarProps) {
  const [isLoginPanelOpen, setIsLoginPanelOpen] = useState(false)

  // Open login panel when shouldOpenLogin changes to true
  useEffect(() => {
    if (shouldOpenLogin) {
      setIsLoginPanelOpen(true)
    }
  }, [shouldOpenLogin])

  const handleLoginSuccess = (userData: { id: string; username: string; email: string }) => {
    setIsLoginPanelOpen(false)
    onLogin(userData)
  }

  const handleLoginPanelClose = () => {
    setIsLoginPanelOpen(false)
    onLoginPanelClose?.()
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <GamepadIcon className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Motus</span>
            </div>

            {/* Navigation & Auth Buttons */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  <Button variant="ghost" size="sm" onClick={onNavigateHome}>
                    <span className="mr-2">🏠</span>
                    Home
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onNavigateLeaderboard}>
                    <span className="mr-2">🏆</span>
                    Leaderboard
                  </Button>
                </>
              )}

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-gray-600">👤</span>
                    <span className="text-sm font-medium text-gray-700">Welcome, {user.username}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={onLogout}>
                    <span className="mr-2">🚪</span>
                    Logout
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsLoginPanelOpen(true)}>
                  <span className="mr-2">🔑</span>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Login Slide Panel */}
      <LoginSlidePanel isOpen={isLoginPanelOpen} onClose={handleLoginPanelClose} onLogin={handleLoginSuccess} />
    </>
  )
}
