//imports
import { UserController } from './user.controller'
import { PostController } from './post.controller'
import { GeneratePostController } from './generatepost.controller'
import { ShortLinkController } from './shortlink.controller'

// exports
export * from './user.controller'
export * from './post.controller'
export * from './generatepost.controller'
export * from './shortlink.controller'
export const controllers = [UserController, PostController, GeneratePostController, ShortLinkController]
