//imports
import { TokenService } from './token.service'
import { UserService } from './user.service'
import { PostService } from './post.service'

// exports
export { TokenService } from './token.service'
export { UserService } from './user.service'
export { PostService } from './post.service'

const services = [TokenService, UserService, PostService]
export default services
  