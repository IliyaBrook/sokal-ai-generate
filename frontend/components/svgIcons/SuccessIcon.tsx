import React from 'react'

import { cn } from '@/lib/cn'

import type { TDiv } from '@/types'

export const SuccessIcon = (props: TDiv) => (
  <div
    className={cn(
      'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-10',
      props.className,
    )}
    {...props}
  >
    <svg
      className="size-6 text-green-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </div>
)