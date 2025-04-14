import { ConfigModule } from '@nestjs/config'

import type { EnvironmentVariables } from '@/types'

export const configProvider =
  ConfigModule.forRoot<EnvironmentVariables>({
    envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    isGlobal: true,
  })