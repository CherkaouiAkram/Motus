"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, RotateCcw, Send, Loader2 } from "lucide-react"
import { Difficulty, GameResponse, LetterState, User } from "@/lib/types"

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
  const [gameId, setGameId] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Track the current request ID
  const requestIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const config = difficultyConfig[difficulty]

  useEffect(() => {
    // Start game on mount and when difficulty changes
    const currentRequestId = ++requestIdRef.current
    startNewGame(currentRequestId)

    return () => {
      // Cancel any ongoing request when component unmounts or difficulty changes
      abortControllerRef.current?.abort()
    }
  }, [difficulty])

  // Focus management
  useEffect(() => {
    if (!gameOver && !isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameOver, isLoading, attempts.length])

  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInitializing])

  const startNewGame = async (requestId: number) => {
    setIsInitializing(true)
    setError("")

    // Cancel any previous request
    abortControllerRef.current?.abort()
    
    // Create new abort controller
    const controller = new AbortController()
    abortControllerRef.current = controller
    const signal = controller.signal
    
    // Reset all game state
    setAttempts([])
    setLetterStates([])
    setGameOver(false)
    setIsWin(false)
    setCurrentGuess("")

    try {
      const response = await fetch("http://localhost:8080/api/games/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ difficulty: difficulty }),
        signal
      })

      // If a newer request has started, ignore this response
      if (requestId !== requestIdRef.current) return
      
      if (response.ok) {
        const data: GameResponse = await response.json()
        setFirstLetter(data.word[0])
        setCurrentWord(data.word)
        setCurrentGuess(data.word[0])
        setGameId(data.gameId)
      } else {
        throw new Error("Failed to start game")
      }
    } catch (error: any) {
      // Only handle error if it's not an abort error
      if (error.name !== 'AbortError' && requestId === requestIdRef.current) {
        setError("Network error. Please try again.")
      }
    } finally {
      // Only update state if this is the latest request
      if (requestId === requestIdRef.current) {
        setIsInitializing(false)
      }
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
      const targetWord = currentWord
      const isCorrect = currentGuess === targetWord

      // Generate letter states
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

      const finalAttempts = attempts.length + 1

      if (isCorrect) {
        setIsWin(true)
        setGameOver(true)
        submitEndGame(finalAttempts)
      } else if (newAttempts.length >= config.maxAttempts) {
        setGameOver(true)
        setIsWin(false)
        submitEndGame(finalAttempts)
      }

      setCurrentGuess(firstLetter)
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const submitEndGame = async (finalAttempts: number) => {
    try {
      const response = await fetch("http://localhost:8080/api/games/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          nbAttempts: finalAttempts,
          gameId: gameId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to end game")
      }
    } catch (error) {
      setError("Network error. Please try again.")
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
        return "bg-red-500 text-white border-red-500"
      case "present":
        return "bg-yellow-500 text-white border-yellow-500"
      case "absent":
        return "bg-blue-400 text-white border-blue-400"
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
            <Button variant="outline" onClick={() => startNewGame(++requestIdRef.current)}>
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
                <Button onClick={() => startNewGame(++requestIdRef.current)}>
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
                <div className="w-6 h-6 bg-red-500 rounded border"></div>
                <span>Correct position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500 rounded border"></div>
                <span>Wrong position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-400 rounded border"></div>
                <span>Not in word</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}