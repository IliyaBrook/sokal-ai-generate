import { ConfigModule } from '@nestjs/config'

import type { EnvironmentVariables } from '@/types'

export const configProvider =
  ConfigModule.forRoot<EnvironmentVariables>({
    envFilePath: ['.env.production', '.env.development', '.env'],
    isGlobal: true,
    ignoreEnvFile: false,
    cache: false,
  })



  