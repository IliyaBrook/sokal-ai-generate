'use client'

import { fetchWithRefresh } from '@/lib/fetchWithRefresh'
import { FetchFunction } from '@/types/common.type'

export const useAuthUserFetch = (): FetchFunction => {
  return async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const result = await fetchWithRefresh<T>({
      url,
      options
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
