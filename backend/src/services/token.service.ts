import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Request } from 'express'
import type { DeleteResult, Model } from 'mongoose'

import { UserDto } from '@/dto'
import { RefreshToken, TRefreshTokenDocument } from '@/schemas'
import type { EnvironmentVariables } from '@/types'

@Injectable()
export class TokenService {
  config: EnvironmentVariables

  constructor(
    readonly configService: ConfigService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshToken>,
  ) {
    this.config = {
      JWT_ACCESS_SECRET: this.configService.get('JWT_ACCESS_SECRET'),
      JWT_REFRESH_SECRET: this.configService.get(
        'JWT_REFRESH_SECRET',
      ),
    } as EnvironmentVariables
  }

  validateToken(
    token: string,
    secret: string,
  ): TRefreshTokenDocument | null {
    return this.jwtService.verify<TRefreshTokenDocument>(token, {
      secret: secret,
    })
  }

  validateAccessToken(token: string): TRefreshTokenDocument | null {
    try {
      return this.validateToken(token, this.config.JWT_ACCESS_SECRET)
    } catch (error) {
      return null
    }
  }

  validateRefreshToken(
    refreshToken: string,
  ): TRefreshTokenDocument | null {
    try {
      const result = this.validateToken(
        refreshToken,
        this.config.JWT_REFRESH_SECRET,
      )
      return result
    } catch (error) {
      return null
    }
  }

  generateTokens(user: UserDto) {
    const payload = { id: user.id, email: user.email }
    
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET')
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET')
    
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets are required for token generation')
    }
    
    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: '30m',
    })
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '30d',
    })
    return {
      accessToken,
      refreshToken,
    }
  }

  findToken(
    refreshToken: string,
  ): Promise<TRefreshTokenDocument | null> {
    return this.refreshTokenModel
      .findOne({
        refreshToken,
      })
      .exec()
  }

  async saveToken(
    userId: string,
    refreshToken: string,
  ): Promise<TRefreshTokenDocument> {
    const tokenData = await this.refreshTokenModel
      .findOne({
        user: userId,
      })
      .exec()

    if (tokenData) {
      tokenData.refreshToken = refreshToken
      await tokenData.save()
      return tokenData
    } else {
      const newToken = new this.refreshTokenModel({
        user: userId,
        refreshToken,
      })
      return await newToken.save()
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }

  removeToken(refreshToken: string): Promise<DeleteResult> {
    return this.refreshTokenModel
      .deleteOne({
        refreshToken,
      })
      .exec()
  }
}
