"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GamepadIcon, Target, Zap, Trophy, Play, CheckCircle, Users, Brain, ArrowRight } from "lucide-react"

type User = {
  id: string
  username: string
  email: string
}

interface HomePageProps {
  user: User | null
  onPlayNow: () => void
}

export function HomePage({ user, onPlayNow }: HomePageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <GamepadIcon className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to <span className="text-primary">Motus</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Challenge your vocabulary skills with the ultimate word-guessing game. Discover hidden words, improve your
              language abilities, and compete with players worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Brain className="mr-2 h-4 w-4" />
                Brain Training
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Users className="mr-2 h-4 w-4" />
                Multiplayer Ready
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Target className="mr-2 h-4 w-4" />3 Difficulty Levels
              </Badge>
            </div>

            {/* Play Now Button */}
            <div className="mb-12">
              <Button size="lg" className="text-lg px-8 py-4" onClick={onPlayNow}>
                <Play className="mr-2 h-5 w-5" />
                {user ? "Continue Playing" : "Play Now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <p className="text-sm text-gray-500 mt-2">Click to sign in and start your word-guessing adventure!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How Motus Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Master the art of word guessing with our intuitive gameplay
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-green-700 dark:text-green-400">Easy Mode</CardTitle>
                <CardDescription>4-letter words • 6 attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Perfect for beginners. Start with shorter words and plenty of chances to guess.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-yellow-700 dark:text-yellow-400">Medium Mode</CardTitle>
                <CardDescription>5-letter words • 5 attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The classic experience. Balanced challenge with standard word length.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Trophy className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-red-700 dark:text-red-400">Hard Mode</CardTitle>
                <CardDescription>6-letter words • 4 attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For word masters. Longer words with fewer chances - ultimate challenge!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Game Rules */}
          <Card className="mb-16">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Game Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Play className="mr-2 h-5 w-5 text-primary" />
                    How to Play
                  </h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      The first letter of the word is always revealed
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Guess the complete word within the allowed attempts
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Each guess must be a valid word starting with the given letter
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Use the color feedback to guide your next guess
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Color Coding</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded border flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong className="text-green-600">Green:</strong> Correct letter in correct position
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded border flex items-center justify-center text-white font-bold">
                        B
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong className="text-yellow-600">Yellow:</strong> Correct letter in wrong position
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-400 rounded border flex items-center justify-center text-white font-bold">
                        C
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        <strong className="text-gray-600">Gray:</strong> Letter not in the word
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <GamepadIcon className="h-8 w-8" />
          </div>
          <p className="text-gray-400">© 2024 Motus Game. Challenge your mind, one word at a time.</p>
        </div>
      </footer>
    </div>
  )
}
