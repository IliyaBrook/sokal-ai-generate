import React from 'react'

export type TDiv = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>
export type FetchFunction = {
  <T>(url: string, options?: RequestInit): Promise<T>
}
