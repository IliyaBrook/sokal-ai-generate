import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'

import { TokenService } from '@/services'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private authService: TokenService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.authService.extractTokenFromHeader(
      request as Request,
    )

    if (!token) {
      throw new UnauthorizedException()
    }

    let payload: any

    try {
      payload = this.authService.validateAccessToken(token)
    } catch {
      throw new UnauthorizedException()
    }

    if (!payload) {
      throw new UnauthorizedException()
    }
    request['user'] = payload

    return true
  }
}
