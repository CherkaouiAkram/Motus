"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Trophy, Medal, Award, Crown, Loader2 } from "lucide-react"
import { LeaderboardEntry, User } from "@/lib/types"


interface LeaderboardProps {
  user: User
  onBack: () => void
}

export function Leaderboard({ user, onBack }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<"overall" | "easy" | "medium" | "hard">("overall")

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  const fetchLeaderboardData = async () => {
    setIsLoading(true)

    try {

      const response = await fetch("http://localhost:8080/api/wallofFame", {
        headers:{
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        }
      })

      if( response.ok) {
        const data : LeaderboardEntry[]  = await response.json();
        console.log(data);


        const sortedData = [...data].sort((a, b) => b.totalScore - a.totalScore)
        setLeaderboardData(sortedData)

        const currentUserStats = sortedData.find((entry) => entry.username === user.username)
        setUserStats(currentUserStats || null)
      }

    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <Trophy className="h-5 w-5 text-gray-500" />
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default"
      case 2:
        return "secondary"
      case 3:
        return "outline"
      default:
        return "outline"
    }
  }

  const getSortedData = () => {
    switch (selectedCategory) {
      case "easy":
        return [...leaderboardData].sort((a, b) => b.easyWins - a.easyWins)
      case "medium":
        return [...leaderboardData].sort((a, b) => b.mediumWins - a.mediumWins)
      case "hard":
        return [...leaderboardData].sort((a, b) => b.hardWins - a.hardWins)
      default:
        return leaderboardData
    }
  }

  const getDisplayValue = (entry: LeaderboardEntry) => {
    switch (selectedCategory) {
      case "easy":
        return `${entry.easyWins} wins`
      case "medium":
        return `${entry.mediumWins} wins`
      case "hard":
        return `${entry.hardWins} wins`
      default:
        return `${entry.totalScore} pts`
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
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leaderboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Top players and rankings</p>
            </div>
          </div>
        </div>

        {/* User Stats Card */}
        {userStats && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userStats.totalScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.winRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.currentStreak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.averageAttempts.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Attempts</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={selectedCategory === "overall" ? "default" : "outline"}
            onClick={() => setSelectedCategory("overall")}
          >
            Overall
          </Button>
          <Button
            variant={selectedCategory === "easy" ? "default" : "outline"}
            onClick={() => setSelectedCategory("easy")}
          >
            Easy Mode
          </Button>
          <Button
            variant={selectedCategory === "medium" ? "default" : "outline"}
            onClick={() => setSelectedCategory("medium")}
          >
            Medium Mode
          </Button>
          <Button
            variant={selectedCategory === "hard" ? "default" : "outline"}
            onClick={() => setSelectedCategory("hard")}
          >
            Hard Mode
          </Button>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {selectedCategory === "overall"
                ? "Overall Rankings"
                : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Mode Rankings`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getSortedData().map((entry, index) => {
                const rank = index + 1
                const isCurrentUser = entry.username === user.username

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? "bg-primary/10 border-primary/30"
                        : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(rank)}
                        <Badge variant={getRankBadgeVariant(rank) as any}>#{rank}</Badge>
                      </div>

                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {entry.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {entry.username}
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {entry.wins}/{entry.totalGames} games won • {entry.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg">{getDisplayValue(entry)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Streak: {entry.currentStreak}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Scoring System</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Easy win: 10 points</li>
                  <li>• Medium win: 20 points</li>
                  <li>• Hard win: 30 points</li>
                  <li>• Bonus for fewer attempts</li>
                  <li>• Streak multiplier bonus</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Statistics</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Win Rate: Percentage of games won</li>
                  <li>• Avg Attempts: Average guesses per win</li>
                  <li>• Current Streak: Consecutive wins</li>
                  <li>• Best Streak: Highest consecutive wins</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
