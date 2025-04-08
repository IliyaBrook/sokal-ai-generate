//imports
import { CheckAdminGuard } from './check-admin.guard'
import { JwtAuthGuard } from './jwt-auth.guard'

//exports
export { JwtAuthGuard } from './jwt-auth.guard'
export { CheckAdminGuard } from './check-admin.guard'
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
    provide: getClassSnakeCaseName(CheckAdminGuard.name),
    useClass: CheckAdminGuard,
  },
]
export default guards