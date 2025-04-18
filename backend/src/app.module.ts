import { GeneratePostService } from '@/services'
import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'

import { controllers } from '@/controllers'
import guards from '@/guards'
import {
  configProvider,
  databaseProviders,
  jwtProvider,
} from '@/providers'
import services from '@/services'
import { PostEditGateway } from './gateways'

@Module({
  imports: [
    ...databaseProviders,
    configProvider,
    jwtProvider,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers,
  providers: [
    GeneratePostService,
    PostEditGateway,
    ...services,
    ...guards,
  ],
})
export class AppModule {}
