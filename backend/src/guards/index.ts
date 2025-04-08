//imports
import { JwtAuthGuard } from './jwt-auth.guard'

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
]
export default guards