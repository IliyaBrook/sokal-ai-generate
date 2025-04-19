'use client'

import { UserDataContext } from '@/contexts/UserData.context'
import { fetchWithRefresh } from '@/lib/fetchWithRefresh'
import { FetchFunction } from '@/types/common.type'
import { useContext } from 'react'

export const useAuthUserFetch = (): FetchFunction => {
  const userData = useContext(UserDataContext)

  return async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const result = await fetchWithRefresh<T>({
      url,
      options,
      onGetRefreshUserData: (data) => {
        if (userData?.setUserData) {
          userData.setUserData(data.user)
        }
      },
    }).catch((error) => {
      if (error.message === 'Not authorized'){
        throw new Error('Not authorized')
      }
      throw error;
    })
    
    if (typeof result === 'string' && result === 'Not authorized') {
      throw new Error('Not authorized')
    }
    
    return result as T
  }
}
