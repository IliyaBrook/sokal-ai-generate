import { IAuthResponse } from '@sokal_ai_generate/shared-types'

export type FetchFunction = {
  <T>(url: string, options?: RequestInit): Promise<T>
}

export type authResponse = Omit<IAuthResponse, 'refreshToken'>;