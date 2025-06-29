"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, X, GamepadIcon } from "lucide-react"
import { API_BASE_URL } from "@/lib/config"

type User = {
  username: string
  email: string
}

type LoginResponse = {
  token: string
}

interface LoginSlidePanelProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: User) => void
}

export function LoginSlidePanel({ isOpen, onClose, onLogin }: LoginSlidePanelProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  })

  // Reset form when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", password: "", username: "" })
      setError("")
      setIsLogin(true)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Mock API call with JWT token - hardcoded credentials
      


      if (isLogin) {
        const response  = await fetch(
          `${API_BASE_URL}/auth/login`, 
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            })
          }
      )
        if (response.ok) {
          const data: LoginResponse = await response.json();
          const userInfo = await fetch(`${API_BASE_URL}/api/user/me`, {
            method: 'GET', 
            headers: {
              Authorization: `Bearer ${data.token}`,
            }
          });

          const userData = await userInfo.json();

           const user : User = {
                  username: userData.pseudo,
                  email: userData.email,
                }
        

          localStorage.setItem("authToken", data.token)
          onLogin(user)
        } else {
          setError("Invalid credentials.")
        }
      } else {

        const response =  await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST', 
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            'pseudo': formData.username,
            'email': formData.email,
            'password': formData.password
          })
        } )
        
        if( response.ok ) {
          const login =  await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST', 
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({
              'email': formData.email,
              'password': formData.password
            })
          })

          if ( login.ok ) {

            const loginData : LoginResponse= await login.json();
            localStorage.setItem("authToken", loginData.token);
            onLogin({
              'email': formData.email,
              'username': formData.username
            })
          } 
        }

      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Slide Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <GamepadIcon className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Motus</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Card className="border-0 shadow-none">
              <CardHeader className="px-0">
                <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                <CardDescription>
                  {isLogin ? "Sign in to continue playing" : "Join the Motus community"}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError("")
                      setFormData({ email: "", password: "", username: "" })
                    }}
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
