"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RotateCcw, Send, Loader2 } from "lucide-react"

type User = {
  id: string
  username: string
  email: string
}

type Difficulty = "easy" | "medium" | "hard"

type LetterState = "correct" | "present" | "absent" | "unknown"

type GameResult = {
  isCorrect: boolean
  letterStates: LetterState[]
  isGameOver: boolean
  isWin: boolean
}

interface GameBoardProps {
  user: User
  difficulty: Difficulty
  onBackToDashboard: () => void
}

const difficultyConfig = {
  easy: { wordLength: 4, maxAttempts: 6 },
  medium: { wordLength: 5, maxAttempts: 5 },
  hard: { wordLength: 6, maxAttempts: 4 },
}

export function GameBoard({ user, difficulty, onBackToDashboard }: GameBoardProps) {
  const [currentWord, setCurrentWord] = useState("")
  const [firstLetter, setFirstLetter] = useState("")
  const [attempts, setAttempts] = useState<string[]>([])
  const [letterStates, setLetterStates] = useState<LetterState[][]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isWin, setIsWin] = useState(false)
  const [error, setError] = useState("")
  const [isInitializing, setIsInitializing] = useState(true)

  // Add ref for input
  const inputRef = useRef<HTMLInputElement>(null)

  const config = difficultyConfig[difficulty]

  useEffect(() => {
    startNewGame()
  }, [difficulty])

  // Add useEffect for auto-focus
  useEffect(() => {
    if (!gameOver && !isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameOver, isLoading, attempts.length])

  // Also focus when game initializes
  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInitializing])

  const startNewGame = async () => {
    setIsInitializing(true)
    setError("")

    // Reset all game state immediately
    setAttempts([])
    setLetterStates([])
    setGameOver(false)
    setIsWin(false)
    setCurrentGuess("")

    try {
      // Mock API call - hardcoded response with random selection
      const mockWordsPool = {
        easy: [
          { firstLetter: "C", word: "CATS" },
          { firstLetter: "D", word: "DOGS" },
          { firstLetter: "B", word: "BIRD" },
          { firstLetter: "F", word: "FISH" },
          { firstLetter: "T", word: "TREE" },
        ],
        medium: [
          { firstLetter: "H", word: "HOUSE" },
          { firstLetter: "W", word: "WORLD" },
          { firstLetter: "P", word: "PLANT" },
          { firstLetter: "S", word: "SMILE" },
          { firstLetter: "M", word: "MUSIC" },
        ],
        hard: [
          { firstLetter: "P", word: "PYTHON" },
          { firstLetter: "C", word: "CASTLE" },
          { firstLetter: "G", word: "GARDEN" },
          { firstLetter: "W", word: "WINDOW" },
          { firstLetter: "B", word: "BRIDGE" },
        ],
      }

      const wordsPool = mockWordsPool[difficulty]
      const randomIndex = Math.floor(Math.random() * wordsPool.length)
      const mockData = wordsPool[randomIndex]

      const response = await fetch("/api/game/new-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ difficulty }),
      }).catch(() => {
        // Mock response for testing
        return {
          ok: true,
          json: () =>
            Promise.resolve({
              firstLetter: mockData.firstLetter,
              gameId: "mock-game-id",
            }),
        }
      })

      const data = await response.json()

      setFirstLetter(mockData.firstLetter)
      setCurrentWord(mockData.word) // Store for game over display
      setCurrentGuess(mockData.firstLetter)
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsInitializing(false)
    }
  }

  const handleSubmitGuess = async () => {
    if (currentGuess.length !== config.wordLength) {
      setError(`Word must be ${config.wordLength} letters long`)
      return
    }

    if (!currentGuess.startsWith(firstLetter)) {
      setError(`Word must start with "${firstLetter}"`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Use the current word instead of hardcoded lookup
      const targetWord = currentWord

      const response = await fetch("/api/game/check-word", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          word: currentGuess,
          difficulty,
          attemptNumber: attempts.length + 1,
        }),
      }).catch(() => {
        // Mock response for testing - keep existing logic
        return { ok: true }
      })

      const isCorrect = currentGuess === targetWord

      // Generate letter states - CORRECTED ALGORITHM
      const guessLetters = currentGuess.split("")
      const targetLetters = targetWord.split("")
      const currentLetterStates: LetterState[] = new Array(guessLetters.length).fill("absent")

      // Create arrays to track which positions have been used
      const targetUsed = new Array(targetLetters.length).fill(false)
      const guessProcessed = new Array(guessLetters.length).fill(false)

      // First pass: Mark exact matches (correct position)
      for (let i = 0; i < guessLetters.length; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          currentLetterStates[i] = "correct"
          targetUsed[i] = true
          guessProcessed[i] = true
        }
      }

      // Second pass: Mark letters that exist but in wrong position
      for (let i = 0; i < guessLetters.length; i++) {
        if (!guessProcessed[i]) {
          // Look for this letter in unused positions of target
          for (let j = 0; j < targetLetters.length; j++) {
            if (!targetUsed[j] && guessLetters[i] === targetLetters[j]) {
              currentLetterStates[i] = "present"
              targetUsed[j] = true
              break
            }
          }
        }
      }

      // Update attempts and letter states
      const newAttempts = [...attempts, currentGuess]
      const newLetterStates = [...letterStates, currentLetterStates]

      setAttempts(newAttempts)
      setLetterStates(newLetterStates)

      if (isCorrect) {
        setIsWin(true)
        setGameOver(true)
      } else if (newAttempts.length >= config.maxAttempts) {
        setGameOver(true)
        setIsWin(false)
      }

      setCurrentGuess(firstLetter)
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    if (value.length <= config.wordLength && value.startsWith(firstLetter)) {
      setCurrentGuess(value)
      setError("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (currentGuess.length === config.wordLength && !isLoading) {
        handleSubmitGuess()
      }
    }
  }

  const getLetterClassName = (state: LetterState) => {
    switch (state) {
      case "correct":
        return "bg-green-500 text-white border-green-500"
      case "present":
        return "bg-yellow-500 text-white border-yellow-500"
      case "absent":
        return "bg-gray-400 text-white border-gray-400"
      default:
        return "bg-white border-gray-300"
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBackToDashboard}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Motus Game</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{difficulty}</Badge>
                <span className="text-sm text-gray-600">
                  {attempts.length}/{config.maxAttempts} attempts
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={startNewGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              New Game
            </Button>
          </div>
        </div>

        {/* Game Board */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              {gameOver ? (
                isWin ? (
                  <span className="text-green-600">🎉 Congratulations! You won!</span>
                ) : (
                  <span className="text-red-600">😞 Game Over! The word was: {currentWord}</span>
                )
              ) : (
                `Find the ${config.wordLength}-letter word starting with "${firstLetter}"`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Previous Attempts */}
            <div className="space-y-2 mb-6">
              {Array.from({ length: config.maxAttempts }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 justify-center">
                  {Array.from({ length: config.wordLength }).map((_, colIndex) => {
                    const attempt = attempts[rowIndex]
                    const letter = attempt ? attempt[colIndex] : ""
                    const state = letterStates[rowIndex] ? letterStates[rowIndex][colIndex] : "unknown"

                    return (
                      <div
                        key={colIndex}
                        className={`w-12 h-12 border-2 rounded flex items-center justify-center font-bold text-lg ${
                          attempt ? getLetterClassName(state) : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Current Input */}
            {!gameOver && (
              <div className="space-y-4">
                <div className="flex gap-2 max-w-sm mx-auto">
                  <Input
                    ref={inputRef}
                    value={currentGuess}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={`Enter ${config.wordLength}-letter word...`}
                    maxLength={config.wordLength}
                    className="text-center font-mono text-lg uppercase"
                    disabled={isLoading}
                  />
                  <Button onClick={handleSubmitGuess} disabled={isLoading || currentGuess.length !== config.wordLength}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Game Over Actions */}
            {gameOver && (
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={startNewGame}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={onBackToDashboard}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Game Instructions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded border"></div>
                <span>Correct position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded border"></div>
                <span>Wrong position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-400 rounded border"></div>
                <span>Not in word</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
