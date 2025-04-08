import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { UserSignInResponseDto } from '../dto/user.dto'

import { SignInDto, SignUpDto, UserDto } from '@/dto'
import { JwtAuthGuard } from '@/guards'
import { TokenService, UserService } from '@/services'
import type { IUser, RequestWithUser } from '@/types'

const days30 = 30 * 24 * 60 * 60 * 1000

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body()
    dto: SignUpDto,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const signUpData = await this.userService.signUp(dto)
    res.cookie('refreshToken', signUpData.refreshToken, {
      maxAge: days30,
      httpOnly: true,
    })

    const user = await this.userService.findById(signUpData.user.id)
    if (!user) {
      throw new UnauthorizedException()
    }
    
    return new UserSignInResponseDto(signUpData.accessToken, {
      ...signUpData,
      user: user
    })
  }

  @Post('sign-in')
  async signIn(
    @Body()
    dto: SignInDto,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const userData = await this.userService.signIn(dto)
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: days30,
      httpOnly: true,
    })
    return new UserSignInResponseDto(userData.accessToken, userData)
  }

  @Post('sign-out')
  async signOut(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      throw new BadRequestException(
        'Refresh token is not provided in cookies',
      )
    }

    const rmResult = await this.tokenService.removeToken(refreshToken)
    if (!rmResult || rmResult.deletedCount === 0) {
      throw new ForbiddenException('Invalid or expired refresh token')
    }

    res.clearCookie('refreshToken')
    res.json({
      message: 'User signed out successfully',
      statusCode: 200,
    })
  }

  @Get('auth')
  async auth(@Req() req: Request) {
    const accessToken = this.tokenService.extractTokenFromHeader(req)
    if (!accessToken) throw new UnauthorizedException()

    const response = this.tokenService.validateAccessToken(accessToken)
    if (!response) {
      throw new UnauthorizedException()
    }
    
    const user = await this.userService.findById(response.id)
    if (!user) {
      throw new UnauthorizedException()
    }
    
    return new UserDto(user)
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = req.cookies
    
    const userData = await this.userService.refresh(refreshToken)
    
    res.cookie('refreshToken', userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    })
    
    const user = await this.userService.findById(userData.user.id)
    
    if (!user) {
      throw new UnauthorizedException()
    }
    
    return res.json({
      accessToken: userData.accessToken,
      user: new UserDto(user)
    })
  }

  // Protected routes
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUsers(
    @Req() req: RequestWithUser,
    @Query('page')
    page?: number,
    @Query('limit')
    limit?: number
  ) {
    const response = await this.userService.getUsers(
      page,
      limit
    )
    if (response.length > 0) {
      return response
    }
    return []
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUser(
    @Req() req: RequestWithUser,
    @Param('id')
    id: string
  ) {
    const user = await this.userService.findOne({ id })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateUser(
    @Req() req: RequestWithUser,
    @Param('id')
    id: string,
    @Body()
    userData: Partial<IUser>,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException(
        'You are not allowed to update this user.',
      );
    }

    const updatedUser = await this.userService.updateUser(id, userData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return new UserDto(updatedUser);
  }
}
