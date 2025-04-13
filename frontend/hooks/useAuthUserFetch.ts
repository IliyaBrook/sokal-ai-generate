'use client'

import { UserDataContext } from "@/contexts/UserData.context"
import { FetchFunction } from "@/types/common.type"
import { IAuthResponse } from "@sokal_ai_generate/shared-types"
import { useRouter } from "next/navigation"
import { useContext } from "react"


export const useAuthUserFetch = (): FetchFunction => {
  const router = useRouter()
  const userData = useContext(UserDataContext)

  const fetchData = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
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
          userData?.setUserData(null)
          router.push('/')
        }
      }
      if (!response.ok) {
        const errorMessage = await response.json()
        if (errorMessage && 'message' in errorMessage) {
          if (errorMessage.statusCode === 400) {
            const serverError = errorMessage.message.join("\n")
            console.error("error message:", serverError)
            throw new Error(serverError)
          }
        }else{
          localStorage.removeItem("accessToken");
          userData?.setUserData(null);
          router.push("/");
        }
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
