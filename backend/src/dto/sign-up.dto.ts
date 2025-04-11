import { IsEmail, MinLength } from 'class-validator'

export class SignUpDto {
  @IsEmail()
  email!: string

  @MinLength(5)
  password!: string

  @MinLength(1)
  firstname!: string

  @MinLength(1)
  lastname!: string
}
