import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { IAuthResponse } from '@sokal_ai_generate/shared-types'

interface SignInData {
  email: string
  password: string
}

export const useAuth = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (data: SignInData): Promise<IAuthResponse | null> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/users/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка при входе')
      }

      const result = await response.json()
      return result
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signIn,
    isLoading,
  }
} 