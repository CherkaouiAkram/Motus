"use client"

import { useState, useEffect } from "react"
import { HomePage } from "@/components/home-page"
import { GameDashboard } from "@/components/game-dashboard"
import { GameBoard } from "@/components/game-board"
import { Leaderboard } from "@/components/leaderboard"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

type User = {
  username: string
  email: string
}

type GameState = "home" | "dashboard" | "playing" | "leaderboard"
type Difficulty = "easy" | "medium" | "hard"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [gameState, setGameState] = useState<GameState>("home")
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy")
  const [isLoading, setIsLoading] = useState(true)
  const [shouldOpenLogin, setShouldOpenLogin] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (token) {        

        const response = await fetch("http://localhost:8080/auth/verify", {
          method: "POST",
          headers: {
            // Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "token":token 
          })
        })

        if (response.ok) {

          const userInfo = await fetch("http://localhost:8080/api/user/me", {
            method: 'GET', 
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });

          const userData = await userInfo.json();

           const user : User = {
                  username: userData.pseudo,
                  email: userData.email,
                }
          setUser(user)
        } else {
          localStorage.removeItem("authToken")
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("authToken")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (userData: User) => {
    console.log(userData);
    setUser(userData)
    setShouldOpenLogin(false)
    // If user clicked "Play Now" and then logged in, redirect to dashboard
    if (shouldOpenLogin) {
      setGameState("dashboard")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
    setGameState("home")
    setShouldOpenLogin(false)
  }

  const handlePlayNow = () => {
    if (user) {
      setGameState("dashboard")
    } else {
      // User needs to login first - trigger the login panel
      setShouldOpenLogin(true)
    }
  }

  const handleStartGame = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty)
    setGameState("playing")
  }

  const handleBackToDashboard = () => {
    setGameState("dashboard")
  }

  const handleBackToHome = () => {
    setGameState("home")
  }

  const handleShowLeaderboard = () => {
    setGameState("leaderboard")
  }

  const handleLoginPanelClose = () => {
    setShouldOpenLogin(false)
  }

  const handleNavigateHome = () => {
    setGameState("home")
  }

  const handleNavigateLeaderboard = () => {
    if (user) {
      setGameState("leaderboard")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        shouldOpenLogin={shouldOpenLogin}
        onLoginPanelClose={handleLoginPanelClose}
        onNavigateHome={handleNavigateHome}
        onNavigateLeaderboard={handleNavigateLeaderboard}
      />

      {gameState === "home" && <HomePage user={user} onPlayNow={handlePlayNow} />}

      {gameState === "dashboard" && user && <GameDashboard user={user} onStartGame={handleStartGame} />}

      {gameState === "playing" && user && (
        <GameBoard user={user} difficulty={selectedDifficulty} onBackToDashboard={handleBackToDashboard} />
      )}

      {gameState === "leaderboard" && user && <Leaderboard user={user} onBack={handleBackToDashboard} />}
    </div>
  )
}
