import { useState } from 'react'

import type { IAuthResponse } from '@sokal_ai_generate/shared-types'

interface AuthOptions {
  endpoint: string
  method?: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const authRequest = async <T extends Record<string, any>>(
    data: T,
    options: AuthOptions
  ): Promise<IAuthResponse | null> => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(options.endpoint, {
        method: options.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Authentication error')
      }

      const result = await response.json()
      return result
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication error')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (data: { email: string; password: string }) => {
    const result = await authRequest(data, {
      endpoint: '/api/users/sign-in',
    })
    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken)
    }
    return result
  }

  const signUp = async (data: {
    email: string
    password: string
    firstname: string
    lastname: string
  }) => {
    const result = await authRequest(data, {
      endpoint: '/api/users/sign-up',
    })
    if (result?.accessToken) {
      localStorage.setItem('accessToken', result.accessToken)
    }
    return result
  }

  return {
    signIn,
    signUp,
    isLoading,
    error,
    setError,
  }
} 