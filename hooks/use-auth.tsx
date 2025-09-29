"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi, getAuthToken, setAuthToken, removeAuthToken } from "@/lib/api"

interface User {
  id: number
  fullName: string
  email: string
  company: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    fullName: string
    email: string
    password: string
    company: string
    role?: string
  }) => Promise<void>
  logout: () => void
  updateProfile: (data: { fullName: string; company: string }) => Promise<void>
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await authApi.getProfile()
        if (response.success && response.data) {
          setUser(response.data.user)
        } else {
          removeAuthToken()
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        removeAuthToken()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        router.push("/")
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData: {
    fullName: string
    email: string
    password: string
    company: string
    role?: string
  }) => {
    try {
      const response = await authApi.register(userData)
      if (response.success && response.data) {
        setAuthToken(response.data.token)
        setUser(response.data.user)
        router.push("/")
      } else {
        throw new Error(response.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      removeAuthToken()
      setUser(null)
      router.push("/login")
    }
  }

  const updateProfile = async (data: { fullName: string; company: string }) => {
    try {
      const response = await authApi.updateProfile(data)
      if (response.success) {
        // Refresh user data
        const profileResponse = await authApi.getProfile()
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data.user)
        }
      } else {
        throw new Error(response.message || "Profile update failed")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    }
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await authApi.changePassword(data)
      if (!response.success) {
        throw new Error(response.message || "Password change failed")
      }
    } catch (error) {
      console.error("Password change error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
