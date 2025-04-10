import { useCallback } from 'react'

import { cn } from '@/lib/cn'
import { usePathname } from 'next/navigation'
interface IUseSetNavActiveClass {
  defaultClasses?: string
  activeClasses: string
  inactiveClasses: string
}

export const useSetNavActiveClass = ({
  defaultClasses,
  activeClasses,
  inactiveClasses,
}: IUseSetNavActiveClass): ((activePath: string) => string) => {
  const pathname = usePathname()

  return useCallback(
    (activePath: string) => {
      const className: string[] = defaultClasses
        ? [defaultClasses]
        : []
      if (activePath === pathname) {
        className.push(activeClasses)
      } else {
        className.push(inactiveClasses)
      }
      return cn(className)
    },
    [pathname],
  )
}

export default useSetNavActiveClass
