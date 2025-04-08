import { Module } from '@nestjs/common'

import { controllers } from '@/controllers'
import guards from '@/guards'
import {
  configProvider,
  databaseProviders,
  jwtProvider,
} from '@/providers'
import services from '@/services'

@Module({
  imports: [
    ...databaseProviders,
    configProvider,
    jwtProvider,
  ],
  controllers,
  providers: [...services, ...guards],
})
export class AppModule {}
