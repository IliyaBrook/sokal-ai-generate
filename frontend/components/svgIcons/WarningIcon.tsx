import React from 'react'

import { cn } from '@/utils/cn'

import type { TDiv } from '@/types'

const WarningIcon = (props: TDiv) => (
  <div
    className={cn(
      'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:size-10',
      props.className,
    )}
    {...props}
  >
    <svg
      className="size-6 text-yellow-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  </div>
)

export default WarningIcon
