import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'

import { CreatePostDto, PostDto, UpdatePostDto } from '@/dto'
import { JwtAuthGuard } from '@/guards'
import { PostService, UserService } from '@/services'
import { RequestWithUser } from '@/types'

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllPosts(@Req() req: RequestWithUser) {
    if (req?.user) {
      const userData = await this.userService.findById(req.user.id)
      if (!userData) {
        throw new UnauthorizedException()
      } else {
        const isAdmin = userData.role === 'admin'
        if (!isAdmin) {
          throw new ForbiddenException(
            'Only admins can access all posts',
          )
        } else {
          const posts = await this.postService.getAllPosts()
          if (posts.length > 0) {
            return posts.map((post) => new PostDto(post))
          }
          return []
        }
      }
    } else {
      throw new UnauthorizedException()
    }
  }

  @Get('public')
  async getPublicPosts() {
    const posts = await this.postService.getPublicPosts()
    return posts.map((post) => new PostDto(post))
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async savePost(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    const userId = req.user.id
    const post = await this.postService.createPost(
      userId,
      createPostDto,
    )
    return new PostDto(post)
  }

  @UseGuards(JwtAuthGuard)
  @Post('schedule')
  async schedulePost(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    if (!createPostDto.scheduledPublishDate) {
      throw new ForbiddenException(
        'Scheduled publish date is required',
      )
    }

    const userId = req.user.id
    const post = await this.postService.createPost(userId, {
      ...createPostDto,
      isPublished: false,
    })
    return new PostDto(post)
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserPosts(@Req() req: RequestWithUser) {
    const userId = req.user.id
    const posts = await this.postService.getUserPosts(userId)
    return posts.map((post) => new PostDto(post))
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postService.getPostById(id)
    return new PostDto(post)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const updatedPost = await this.postService.updatePost(
      id,
      updatePostDto,
    )
    return new PostDto(updatedPost)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id
    const post = await this.postService.getPostById(id)

    // Allow admins to delete any post, but regular users can only delete their own posts
    if (
      req.user.role !== 'admin' &&
      post.authorId.toString() !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      )
    }

    await this.postService.deletePost(id)
    return { success: true }
  }
}
