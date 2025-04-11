import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import {
  RefreshToken,
  RefreshTokenSchema,
  User,
  UserSchema,
  Post,
  PostSchema,
  ShortLink,
  ShortLinkSchema
} from '@/schemas'
import type { EnvironmentVariables } from '@/types'

export const databaseProviders = [
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get<EnvironmentVariables['DB_URL']>(
        'DB_URL',
      ),
    }),
  }),
  MongooseModule.forFeature([
    {
      name: User.name,
      schema: UserSchema,
    },
    {
      name: RefreshToken.name,
      schema: RefreshTokenSchema,
    },
    {
      name: Post.name,
      schema: PostSchema,
    },
    {
      name: ShortLink.name,
      schema: ShortLinkSchema,
    },
  ]),
]
