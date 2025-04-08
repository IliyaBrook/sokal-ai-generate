import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

export const jwtProvider = JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  global: true,
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_ACCESS_SECRET'),
    signOptions: {
      expiresIn: '30m',
    },
  }),
})
