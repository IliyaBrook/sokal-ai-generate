//imports
import { JwtAuthGuard } from './jwt-auth.guard'
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

//exports
export { JwtAuthGuard } from './jwt-auth.guard'
const getClassSnakeCaseName = (className: string) =>
  className
    .split(/(?=[A-Z])/)
    .map((w) => w.toUpperCase())
    .join('_')
const guards = [
  {
    provide: getClassSnakeCaseName(JwtAuthGuard.name),
    useClass: JwtAuthGuard,
  },
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard,
  },
]
export default guards