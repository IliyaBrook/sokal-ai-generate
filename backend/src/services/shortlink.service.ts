import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { randomBytes } from 'crypto'
import { ConfigService } from '@nestjs/config'

import { ShortLink, TShortLinkDocument } from '@/schemas'
import { ICreateShortLinkDto, IShortLinkResponse } from '@sokal_ai_generate/shared-types'

@Injectable()
export class ShortLinkService {
  constructor(
    @InjectModel(ShortLink.name)
    private shortLinkModel: Model<TShortLinkDocument>,
    private configService: ConfigService,
  ) {}

  private generateCode(): string {
    return randomBytes(4).toString('hex')
  }

  private getBaseUrl(): string {
    return this.configService.get<string>('BASE_URL') || 'http://localhost:4000'
  }

  private getExpiryDate(): Date {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date
  }

  async create(userId: string, dto: ICreateShortLinkDto): Promise<IShortLinkResponse> {
    const code = this.generateCode()
    
    const shortLink = await this.shortLinkModel.create({
      code,
      targetType: dto.targetType,
      targetId: dto.targetId,
      creator: userId,
      expiresAt: this.getExpiryDate(),
    })

    return this.mapToResponse(shortLink)
  }

  async getByCode(code: string): Promise<IShortLinkResponse> {
    const shortLink = await this.shortLinkModel.findOne({ code })
    
    if (!shortLink) {
      throw new NotFoundException('Short link not found')
    }

    if (shortLink.expiresAt && shortLink.expiresAt < new Date()) {
      throw new NotFoundException('Short link has expired')
    }

    return this.mapToResponse(shortLink)
  }

  async cleanupExpiredLinks(): Promise<number> {
    const now = new Date()
    const result = await this.shortLinkModel.deleteMany({
      expiresAt: { $lt: now }
    })
    return result.deletedCount
  }

  private mapToResponse(shortLink: TShortLinkDocument): IShortLinkResponse {
    return {
      id: shortLink.id,
      code: shortLink.code,
      targetType: shortLink.targetType,
      targetId: shortLink.targetId,
      createdAt: shortLink.createdAt,
      expiresAt: shortLink.expiresAt,
      url: `${this.getBaseUrl()}/api/short/${shortLink.code}`
    }
  }
} 