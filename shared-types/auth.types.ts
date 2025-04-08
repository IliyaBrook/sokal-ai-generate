import { IUser, TUserRoles } from './user.types'

export interface IAuthResponse {
  user: IUser
  accessToken: string
  refreshToken: string
}

export interface ISignUpData {
  email: string
  password: string
  firstname: string
  lastname: string
  role?: TUserRoles
} 

export interface ISignInData {
  email: string;
  password: string;
}

export interface ISignUpData extends ISignInData {
  firstname: string;
  lastname: string;
}