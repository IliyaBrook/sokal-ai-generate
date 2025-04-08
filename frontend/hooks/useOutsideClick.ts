import React from 'react'
import { useEffect } from 'react'

const useOutsideClick = (
  ref: React.RefObject<any>,
  callback: () => void,
  ignoreRef?: React.RefObject<any>,
): void => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (!ignoreRef ||
          !ignoreRef.current ||
          !ignoreRef.current.contains(event.target as Node))
      ) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref, callback, ignoreRef])
}

export default useOutsideClick
