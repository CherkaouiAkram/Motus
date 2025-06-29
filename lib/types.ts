type User = {
    username: string;
    email: string;
};


type GameState = "home" | "dashboard" | "playing" | "leaderboard";
type Difficulty = "easy" | "medium" | "hard";

type LetterState = "correct" | "present" | "absent" | "unknown"

type GameResult = {
  isCorrect: boolean
  letterStates: LetterState[]
  isGameOver: boolean
  isWin: boolean
}


type LeaderboardEntry = {
  id: string
  username: string
  totalGames: number
  wins: number
  winRate: number
  averageAttempts: number
  bestStreak: number
  currentStreak: number
  totalScore: number
  easyWins: number
  mediumWins: number
  hardWins: number
}

type GameResponse = {
  word: string
  gameId: string
}



export type { User, GameState, Difficulty, LetterState, GameResult, LeaderboardEntry, GameResponse };