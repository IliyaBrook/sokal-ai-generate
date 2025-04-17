"use client"

import { fetchWithRefresh } from '@/lib';
import type { IUser } from '@sokal_ai_generate/shared-types';
import { usePathname, useRouter } from 'next/navigation';
import React, {
  type Dispatch,
  type SetStateAction,
  useLayoutEffect
} from 'react';

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
  const navigate = useRouter()
  const pathname = usePathname()

  useLayoutEffect(() => {
      void fetchWithRefresh<IUser>({
      url: '/api/users/auth',
      onGetData: (data) => {
        setUserData(data)
      },
      onGetRefreshUserData: (data) => {
        setUserData(data.user)
      },
      onFalseRefreshUserData: () => {
        navigate.push('/')
      },
      onErrorMessage: (error) => {
        console.log(error)
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

