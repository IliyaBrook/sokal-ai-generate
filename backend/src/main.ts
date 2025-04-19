import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })
  app.use(cookieParser())
  app.setGlobalPrefix('api')

  app.enableCors({
    origin: function (origin: any, callback: any) {
      if (!origin) return callback(null, true)

      const allowedOrigins = [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost',
        'http://localhost:80',
        'http://frontend:3000',
        'http://157.180.25.1',
        'http://157.180.25.1:80',
        'http://iliyabrook.com',
      ]

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:')
      if (isAllowed) {
        return callback(null, true)
      } else {
        console.warn(`Origin ${origin} not allowed by CORS`)
        return callback(null, false)
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0')
}
void bootstrap()
