'use client'

import { fetchWithRefresh } from '@/lib'
import type { IUser } from '@sokal_ai_generate/shared-types'
import { usePathname } from 'next/navigation'
import React, { type Dispatch, type SetStateAction, useEffect, useLayoutEffect } from 'react'

interface IUserDataContext {
  children: React.ReactNode
}

interface IUserDataProvider {
  userData: IUser | null
  setUserData: Dispatch<SetStateAction<IUser | null>>
}

export const UserDataContext =
  React.createContext<IUserDataProvider | null>(null)

export const UserDataProvider: React.FC<IUserDataContext> = ({
  children,
}) => {
  const [userData, setUserData] = React.useState<IUser | null>(null)
  const pathname = usePathname()
  
  useEffect(() => {
      void fetchWithRefresh<IUser>({
      url: '/api/users/auth',
    }).then(response => {
       if (response) {
         setUserData(response)
       }
      })
  }, [pathname])
  
  const providedData = {
    userData,
    setUserData,
  }

  return (
    <UserDataContext.Provider value={providedData}>
      {children}
    </UserDataContext.Provider>
  )
}

