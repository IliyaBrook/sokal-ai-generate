//imports
import { TokenService } from './token.service'
import { UserService } from './user.service'
import { PostService } from './post.service'
import { GeneratePostService } from './generatepost.service'
import { SchedulerService } from './scheduler.service'
import { ShortLinkService } from './shortlink.service'

// exports
export { TokenService } from './token.service'
export { UserService } from './user.service'
export { PostService } from './post.service'
export { GeneratePostService } from './generatepost.service'
export { SchedulerService } from './scheduler.service'
export { ShortLinkService } from './shortlink.service'

const services = [TokenService, UserService, PostService, GeneratePostService, SchedulerService, ShortLinkService]
export default services
  