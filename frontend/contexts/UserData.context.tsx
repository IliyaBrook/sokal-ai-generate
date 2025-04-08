import type { IAuthResponse, IUser } from '@sokal_ai_generate/shared-types'
import React, {
  type Dispatch,
  type SetStateAction,
  useLayoutEffect,
} from 'react'
import { useRouter, usePathname } from 'next/navigation';

interface IUserDataContext {
  children: React.ReactNode
}

interface IUserDataProvider {
  userData: IUser | null
  setUserData: Dispatch<SetStateAction<IUser | null>>
}

export const UserDataProvider =
  React.createContext<IUserDataProvider | null>(null)

export const UserDataContext: React.FC<IUserDataContext> = ({
  children,
}) => {
  const [userData, setUserData] = React.useState<IUser | null>(null)
  const navigate = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = React.useState(false)

  useLayoutEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        setIsLoading(true)
        fetch('api/users/auth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              setUserData(data)
            })
          } else if (response.status === 401) {
            fetch('/users/refresh').then((res) => {
              if (res.ok) {
                res.json().then((data: IAuthResponse) => {
                  const accessToken = data.accessToken
                  localStorage.setItem('accessToken', accessToken)
                })
              } else {
                localStorage.removeItem('accessToken')
                navigate.push('/')
              }
            })
          }
        })
      } catch {
        console.log('Not authorized')
        setIsLoading(false)
      } finally {
        setIsLoading(false)
      }
    }
  }, [pathname])

  const providedData = {
    userData,
    setUserData,
  }

  return (
    <UserDataProvider.Provider value={providedData}>
      {children}
    </UserDataProvider.Provider>
  )
}
