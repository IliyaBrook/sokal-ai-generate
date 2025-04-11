import { IsEnum, IsString } from 'class-validator'
import { ICreateShortLinkDto } from '@sokal_ai_generate/shared-types'

export class CreateShortLinkDto implements ICreateShortLinkDto {
  @IsEnum(['post', 'other'], { message: 'Target type must be either post or other' })
  targetType: 'post' | 'other'

  @IsString()
  targetId: string
} 