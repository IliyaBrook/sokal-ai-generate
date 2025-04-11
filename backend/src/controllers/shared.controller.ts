import { Controller, Get, NotFoundException, Param } from '@nestjs/common'

import { SharedService } from '@/services'

@Controller('shared')
export class SharedController {
  constructor(private readonly sharedService: SharedService) {}

  @Get(':code')
  async getSharedContent(@Param('code') code: string) {
    try {
      return await this.sharedService.getSharedContent(code)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new NotFoundException('Content not found')
    }
  }
} 