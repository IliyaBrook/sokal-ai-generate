//imports
import { UserController } from './user.controller'
import { PostController } from './post.controller'

// exports
export * from './user.controller'
export * from './post.controller'
export const controllers = [UserController, PostController]
