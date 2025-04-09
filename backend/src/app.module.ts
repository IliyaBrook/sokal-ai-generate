import { GeneratePostService } from './services/generatepost.service';
import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler';

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
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  controllers,
  providers: [
        GeneratePostService, 
    ...services,
    ...guards
  ],
})
export class AppModule {}
