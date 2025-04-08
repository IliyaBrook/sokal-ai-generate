export * from './config.types'
export * from '@sokal_ai_generate/shared-types'

import { Request } from 'express'

export interface RequestWithUser extends Request {
  user: {
    id: string
    email: string
  }
}
