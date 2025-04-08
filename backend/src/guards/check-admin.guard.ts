import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { JwtAuthGuard } from './jwt-auth.guard'
import { TokenService, UserService } from '@/services'

@Injectable()
export class CheckAdminGuard extends JwtAuthGuard {
  constructor(
    protected readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {
    super(tokenService)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const isAuthenticated = await super.canActivate(context)
    if (!isAuthenticated) {
      return false
    }

    const user = request['user']
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'Invalid user information in token',
      )
    }
    const userFromDb = await this.userService.findById(user.id)
    if (!userFromDb) {
      throw new UnauthorizedException('User not found')
    }

    if (userFromDb.role !== 'admin') {
      throw new UnauthorizedException('User is not an admin')
    }

    return true
  }
}
