//imports
import { TokenService } from './token.service'
import { UserService } from './user.service'
import { PostService } from './post.service'
import { GeneratePostService } from './generatepost.service'

// exports
export { TokenService } from './token.service'
export { UserService } from './user.service'
export { PostService } from './post.service'
export { GeneratePostService } from './generatepost.service'

const services = [TokenService, UserService, PostService, GeneratePostService]
export default services
  