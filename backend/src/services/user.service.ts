import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import type {
  IAuthResponse,
  ISignUpData,
  IUserRoleOp,
} from '@sokal_ai_generate/shared-types'
import * as bcrypt from 'bcrypt'
import type { Model } from 'mongoose'

import { SignInDto, SignUpDto, UserDto } from '@/dto'
import { TUserDocument, User } from '@/schemas'
import type { IUser } from '@/types'
import { TokenService } from './token.service'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<TUserDocument>,
    private tokenService: TokenService,
  ) {}

  findById(id: string): Promise<UserDto | null> {
    let query = this.userModel.findById(id)
    return query.exec()
  }

  async updateUser(
    id: string,
    userData: Partial<IUser>,
  ): Promise<UserDto | null> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 3)
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      userData,
      { new: true },
    )
    return user ? new UserDto(user) : null
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec()
    return !!result
  }

  async getUsers(page?: number, limit?: number) {
    let query = this.userModel.find().sort({
      createdAt: -1,
    })
    if (page !== undefined && limit !== undefined) {
      const offset = (page - 1) * limit
      query = query
        .find({}, 'name email password')
        .sort({
          createdAt: -1,
        })
        .skip(offset)
        .limit(limit)
    }
    return query.exec()
  }

  async findOne(
    projection: Record<string, any>,
  ): Promise<TUserDocument | null> {
    return this.userModel.findOne(projection).exec()
  }

  async createUser(userData: ISignUpData & { role?: IUserRoleOp }): Promise<TUserDocument> {
    const user = new this.userModel(userData)
    return user.save()
  }

  async signIn(dto: SignInDto) {
    const user = await this.findOne({
      email: dto.email,
    })
    if (!user) {
      throw new HttpException(
        'Login error, please check your credentials',
        HttpStatus.BAD_REQUEST,
      )
    }
    const isPassEquals = await bcrypt.compare(
      dto.password,
      user.password,
    )
    if (!isPassEquals) {
      throw new HttpException(
        'Login error, please check your credentials',
        HttpStatus.BAD_REQUEST,
      )
    }
    const userDto = new UserDto(user)
    const tokens = this.tokenService.generateTokens(userDto)
    await this.tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto,
    }
  }

  async signUp(dto: SignUpDto): Promise<{
    user: UserDto
    accessToken: string
    refreshToken: string
  }> {
    const { email, password, firstname, lastname } = dto

    const candidate = await this.findOne({
      email,
    })
    if (candidate) {
      throw new HttpException(
        `User with email ${email} already exists`,
        HttpStatus.BAD_REQUEST,
      )
    }
    const hashPassword = await bcrypt.hash(password, 3)
    const user = await this.createUser({
      email,
      password: hashPassword,
      firstname,
      lastname,
    })
    const userDto = new UserDto(user)
    const tokens = this.tokenService.generateTokens(userDto)
    await this.tokenService.saveToken(userDto.id, tokens.refreshToken)
    return {
      ...tokens,
      user: userDto,
    }
  }

  async refresh(refreshToken: string): Promise<IAuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException()
    }
    const userData =
      this.tokenService.validateRefreshToken(refreshToken)

    const tokenFromDb =
      await this.tokenService.findToken(refreshToken)
    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException()
    }
    const user = await this.findById(userData.id)
    if (user) {
      const userDto = new UserDto(user)
      const tokens = this.tokenService.generateTokens({
        ...userDto,
      })
      await this.tokenService.saveToken(
        userDto.id,
        tokens.refreshToken,
      )

      return {
        ...tokens,
        user: userDto,
      }
    } else {
      throw new UnauthorizedException()
    }
  }
}
