"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Trophy, Target, Zap } from "lucide-react"
import { Difficulty, User } from "@/lib/types"



interface GameDashboardProps {
  user: User
  onStartGame: (difficulty: Difficulty) => void
}

const difficultyConfig = {
  easy: {
    icon: Target,
    title: "Easy",
    description: "4-letter words, 6 attempts",
    color: "bg-green-500",
    badge: "default",
  },
  medium: {
    icon: Zap,
    title: "Medium",
    description: "5-letter words, 5 attempts",
    color: "bg-yellow-500",
    badge: "secondary",
  },
  hard: {
    icon: Trophy,
    title: "Hard",
    description: "6-letter words, 4 attempts",
    color: "bg-red-500",
    badge: "destructive",
  },
} as const

export function GameDashboard({ user, onStartGame }: GameDashboardProps) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.username}!</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Choose your difficulty level and start playing</p>
          </div>
          {/* Removed buttons - now in navbar */}
        </div>

        {/* Difficulty Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(difficultyConfig) as [Difficulty, (typeof difficultyConfig)[Difficulty]][]).map(
            ([difficulty, config]) => {
              const IconComponent = config.icon
              return (
                <Card key={difficulty} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 rounded-full ${config.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {config.title}
                      <Badge variant={config.badge as any}>{difficulty}</Badge>
                    </CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => onStartGame(difficulty)}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              )
            },
          )}
        </div>

        {/* Game Rules */}
        <Card>
          <CardHeader>
            <CardTitle>How to Play Motus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Game Rules:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Guess the hidden word within the allowed attempts</li>
                  <li>• The first letter is always revealed</li>
                  <li>• Red: Correct letter in correct position</li>
                  <li>• Yellow: Correct letter in wrong position</li>
                  <li>• Blue: Letter not in the word</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Difficulty Levels:</h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    • <span className="font-medium text-red-600">Easy:</span> 4 letters, 6 attempts
                  </li>
                  <li>
                    • <span className="font-medium text-yellow-600">Medium:</span> 5 letters, 5 attempts
                  </li>
                  <li>
                    • <span className="font-medium text-blue-600">Hard:</span> 6 letters, 4 attempts
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
