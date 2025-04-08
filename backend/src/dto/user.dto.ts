import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsOptional, MinLength } from 'class-validator'
import { IUser, IAuthResponse } from '@sokal_ai_generate/shared-types'

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

  constructor(user: Omit<IUser, 'password'>) {
    this.id = user.id!
    this.firstname = user.firstname
    this.lastname = user.lastname
    this.email = user.email
  }
}

export class UserSignInDto extends UserDto {
  @Expose()
  password: string

  constructor(user: IUser & { password: string }) {
    super(user)
    this.password = user.password
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
      email: user.user.email
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
