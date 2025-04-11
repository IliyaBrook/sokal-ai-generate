import { IUser } from './user.types'
import { ObjectId } from './mongoose.types'

export interface IShortLink {
  id: string
  code: string
  targetType: 'post' | 'other'
  targetId: string
  creator: string | IUser
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ICreateShortLinkDto {
  targetType: 'post' | 'other'
  targetId: string
}

export interface IShortLinkResponse {
  id: string
  code: string
  targetType: string
  targetId: string
  createdAt: Date
  expiresAt?: Date
  url: string
} 