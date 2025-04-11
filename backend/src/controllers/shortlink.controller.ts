import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'

import { ShortLinkService } from '@/services'
import { CreateShortLinkDto } from '@/dto'
import { JwtAuthGuard } from '@/guards'
import { IShortLinkResponse } from '@sokal_ai_generate/shared-types'

interface RequestWithUser extends Request {
  user: { id: string }
}

@Controller('short')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateShortLinkDto,
    @Req() req: RequestWithUser,
  ): Promise<IShortLinkResponse> {
    return this.shortLinkService.create(req.user.id, dto)
  }

  @Get(':code')
  async getByCode(@Param('code') code: string): Promise<IShortLinkResponse> {
    return this.shortLinkService.getByCode(code)
  }
} 