export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  password?: string
  posts?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface IRefreshToken {
  token: string
  user: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}