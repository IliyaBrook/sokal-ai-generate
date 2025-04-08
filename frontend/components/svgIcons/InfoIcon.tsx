import React from 'react'

import { cn } from '@/utils/cn'

import type { TDiv } from '@/types'

const InfoIcon = (props: TDiv) => (
  <div
    className={cn(
      'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10',
      props.className,
    )}
    {...props}
  >
    <svg
      className="size-6 text-blue-600"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  </div>
)

export default InfoIcon

