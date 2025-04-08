import { ConfigModule } from '@nestjs/config'

import type { EnvironmentVariables } from '@/types'

export const configProvider =
  ConfigModule.forRoot<EnvironmentVariables>({
    envFilePath: ['.env.development', '.env.production', '.env'],
    isGlobal: true,
  })



  