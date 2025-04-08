export type TAlertOptions = 'success' | 'info' | 'warning' | 'error'
export type TAlertPosition =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'center'
  | 'center-start'
  | 'center-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'

export interface IAlert {
  isShown: boolean
  type?: TAlertOptions
  showIcon?: boolean
  header?: string
  message?: string
  className?: string
  position?: TAlertPosition
  onClose?: () => void
  distance?: number
}
