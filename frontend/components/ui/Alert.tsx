import React, { useEffect } from 'react'

import { CloseIcon, ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from '@/components/svgIcons'

import { cn } from '@/lib/cn'

import type { IAlert } from '@/types'

export const Alert: React.FC<IAlert> = ({
  type = 'error',
  message,
  showIcon = true,
  header,
  onClose,
  isShown = false,
  distance = 8,
  position = 'bottom',
}) => {
  const [dialogSize, setDialogSize] = React.useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })

  const dialogRef = React.useRef<HTMLDivElement>(null)
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    width: '100%',
    maxWidth: '100%',
    padding: '0 16px',
    boxSizing: 'border-box'
  }

  useEffect(() => {
    const dialogWidth = dialogRef.current?.offsetWidth
    const dialogHeight = dialogRef.current?.offsetHeight
    if (dialogWidth && dialogHeight) {
      setDialogSize((prev) => {
        if (
          prev.width !== dialogWidth ||
          prev.height !== dialogHeight
        ) {
          return { width: dialogWidth, height: dialogHeight }
        }
        return prev
      })
    }
  }, [isShown, position])

  switch (position) {
    case 'bottom':
      positionStyles.bottom = `${distance}px`
      positionStyles.left = '0'
      break
    case 'top':
      positionStyles.top = `${distance}px`
      positionStyles.left = '0'
      break
    case 'center':
      positionStyles.top = `calc(50% - ${dialogSize.height / 2}px)`
      positionStyles.left = '0'
      break
    case 'top-end':
      positionStyles.top = `${distance}px`
      positionStyles.right = `${distance}px`
      break
    case 'top-start':
      positionStyles.top = `${distance}px`
      positionStyles.left = `${distance}px`
      break
    case 'center-start':
      positionStyles.top = `calc(50% - ${dialogSize.height / 2}px)`
      positionStyles.left = `${distance}px`
      break
    case 'center-end':
      positionStyles.top = `calc(50% - ${dialogSize.height / 2}px)`
      positionStyles.right = `${distance}px`
      break
    case 'bottom-start':
      positionStyles.bottom = `${distance}px`
      positionStyles.left = `${distance}px`
      break
    case 'bottom-end':
      positionStyles.bottom = `${distance}px`
      positionStyles.right = `${distance}px`
      break
  }

  return (
    <div
      className={cn(
        "relative z-10 transition-all duration-300 ease-in-out",
        isShown ? "opacity-100 visible" : "opacity-0 invisible",
        position.includes('bottom') && !isShown ? "translate-y-4" : "",
        position.includes('top') && !isShown ? "-translate-y-4" : ""
      )}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      ref={dialogRef}
      style={{
        ...positionStyles,
        pointerEvents: isShown ? 'auto' : 'none',
      }}
    >
      <div className="max-w-[600px] mx-auto">
        <div
          className="shadow-[0_1px_15px_rgba(0,0,0,0.1)] inset-shadow-5 relative transform overflow-hidden rounded-lg bg-white text-left transition-all w-full"
        >
          {onClose && typeof onClose === 'function' && (
            <div className="absolute right-2 top-1" onClick={onClose}>
              <CloseIcon sizeViewBox={18} />
            </div>
          )}
          <div
            className={cn(
              'bg-white px-4 pt-5 pb-4',
              header ? 'sm:p-6' : 'sm:p-4',
            )}
          >
            <div className="flex items-start">
              {showIcon && (
                <div className="flex-shrink-0">
                  {type === 'error' ? (
                    <ErrorIcon />
                  ) : type === 'success' ? (
                    <SuccessIcon />
                  ) : type === 'info' ? (
                    <InfoIcon />
                  ) : (
                    <WarningIcon />
                  )}
                </div>
              )}

              <div className="ml-3 w-0 flex-1">
                {header && (
                  <h3
                    className="text-base font-semibold text-gray-900"
                    id="modal-title"
                  >
                    {header}
                  </h3>
                )}
                <div className="mt-2">
                  {message && (
                    <p
                      id="modal-description"
                      className="text-sm text-gray-500"
                    >
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
