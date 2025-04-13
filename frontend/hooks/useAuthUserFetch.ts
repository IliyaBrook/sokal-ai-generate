'use client'

import { UserDataContext } from "@/contexts/UserData.context"
import { fetchWithRefresh } from "@/lib/fetchWithRefresh"
import { FetchFunction } from "@/types/common.type"
import { useRouter } from "next/navigation"
import { useContext } from "react"

export const useAuthUserFetch = (): FetchFunction => {
  const router = useRouter()
  const userData = useContext(UserDataContext)

  const fetchData = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      fetchWithRefresh<T>({
        url,
        options,
        onGetData: (data) => {
          resolve(data)
        },
        onGetRefreshUserData: (data) => {
          if (userData?.setUserData) {
            userData.setUserData(data.user)
          }
        },
        onFalseRefreshUserData: () => {
          userData?.setUserData(null)
          router.push('/')
        },
        onErrorMessage: (error) => {
          console.error('Fetch error:', error)
          reject(new Error(error.message))
        }
      })
    })
  }
  
  return fetchData
}
