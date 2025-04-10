import React from 'react'

import { cn } from '@/lib/cn'

interface ICloseIcon extends React.SVGProps<SVGSVGElement> {
  sizeViewBox?: number
}

export const CloseIcon: React.FC<ICloseIcon> = ({
  sizeViewBox = 20,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={`0 0 ${sizeViewBox} ${sizeViewBox}`}
    fill="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className={cn(
      'size-5',
      'text-gray-500',
      'hover:text-gray-700',
      'transition-colors duration-150 ease-in-out cursor-pointer',
      props.className,
    )}
    {...props}
  >
    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
  </svg>
)
