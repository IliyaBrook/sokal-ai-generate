import {
  IAuthResponse,
  IUser,
  type IUserRoleOp,
} from '@sokal_ai_generate/shared-types'
import { Expose } from 'class-transformer'
import { IsEmail, MinLength } from 'class-validator'

export class UserDto implements Omit<IUser, 'password'> {
  @Expose()
  id: string

  @Expose()
  firstname: string

  @Expose()
  lastname: string

  @IsEmail()
  email!: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date

  @Expose()
  role!: IUserRoleOp

  constructor(user: Omit<IUser, 'password'>) {
    this.id = user.id!
    this.firstname = user.firstname
    this.lastname = user.lastname
    this.email = user.email
    if (!user.role) {
      this.role = 'user'
    } else {
      this.role = user.role
    }
  }
}

export class UserSignInResponseDto {
  @Expose()
  accessToken: string

  @Expose()
  user: {
    id: string
    firstname: string
    lastname?: string
    email: string
  }

  constructor(accessToken: string, user: IAuthResponse) {
    this.accessToken = accessToken
    this.user = {
      id: user.user.id,
      firstname: user.user.firstname,
      lastname: user.user.lastname,
      email: user.user.email,
    }
  }
}

export class SignUpDto {
  @IsEmail()
  email: string

  @MinLength(6)
  password: string

  @MinLength(2)
  name: string
}
