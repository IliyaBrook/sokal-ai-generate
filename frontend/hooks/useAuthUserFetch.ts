'use client'

import { UserDataContext } from "@/contexts/UserData.context"
import { IAuthResponse } from "@sokal_ai_generate/shared-types"
import { useRouter } from "next/navigation"
import { useContext } from "react"

type FetchFunction<T> = (url: string, options?: RequestInit) => Promise<T>;

const useAuthUserFetch = <T>(): FetchFunction<T> => {
  const router = useRouter()
  const userData = useContext(UserDataContext)

  const fetchData = async (url: string, options: RequestInit = {}): Promise<T> => {
    const token = localStorage.getItem('accessToken')
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string> || {}),
      },
    }
    try {
      let response = await fetch(url, fetchOptions)
      if (response.status === 401 && token) {
        const refreshResponse = await fetch('/api/users/refresh')
        if (refreshResponse.ok) {
          const data: IAuthResponse = await refreshResponse.json()
          localStorage.setItem('accessToken', data.accessToken)
          if (userData?.setUserData) {
            userData.setUserData(data.user)
          }
          const newHeaders = fetchOptions.headers as Record<string, string>
          newHeaders['Authorization'] = `Bearer ${data.accessToken}`
          response = await fetch(url, fetchOptions)
        } else {
          localStorage.removeItem('accessToken')
          router.push('/')
          throw new Error('Authentication failed')
        }
      }
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      return result as T
    } catch (error) {
      console.error('Fetch error:', error)
      throw error
    }
  }
  
  return fetchData
}

export default useAuthUserFetch
