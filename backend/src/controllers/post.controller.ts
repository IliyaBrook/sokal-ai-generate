import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'

import { CreatePostDto, PostDto, UpdatePostDto } from '@/dto'
import { JwtAuthGuard } from '@/guards'
import { PostService } from '@/services'
import { RequestWithUser } from '@/types'

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async savePost(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    const userId = req.user.id
    const post = await this.postService.createPost(userId, createPostDto)
    return new PostDto(post)
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUserPosts(@Req() req: RequestWithUser) {
    const userId = req.user.id
    const posts = await this.postService.getUserPosts(userId)
    return posts.map(post => new PostDto(post))
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postService.getPostById(id)
    return new PostDto(post)
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updatePost(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const userId = req.user.id
    console.log('[change post userId]:', userId)
    const post = await this.postService.getPostById(id)
    
    if (post.authorId.toString() !== userId) {
      throw new ForbiddenException('You are not allowed to update this post')
    }

    const updatedPost = await this.postService.updatePost(id, userId, updatePostDto)
    return new PostDto(updatedPost)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const userId = req.user.id
    const result = await this.postService.deletePost(id, userId)
    if (!result) {
      throw new NotFoundException(`Post with ID ${id} not found or you don't have permission`)
    }
    return { success: true }
  }
} 