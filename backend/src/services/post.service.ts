import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreatePostDto, UpdatePostDto } from '@/dto'
import { Post, TPostDocument } from '@/schemas'
import { EnvironmentVariables } from '@/types'

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name)

  constructor(
    @InjectModel(Post.name)
    private postModel: Model<TPostDocument>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<EnvironmentVariables['OPENAI_API_KEY']>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
  }

  async getPublicPosts(): Promise<TPostDocument[]> {
    return this.postModel.find({ isPublished: true }).exec()
  }

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<TPostDocument> {
    const post = new this.postModel({
      ...createPostDto,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this.logger.log(`Creating post with title: ${createPostDto.title} for user: ${userId}`)
    return post.save()
  }

  async updatePost(
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<TPostDocument> {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      { $set: updatePostDto },
      { new: true }
    )

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`)
    }

    return post
  }

  async getPostById(postId: string): Promise<TPostDocument> {
    this.logger.log(`Fetching post by id: ${postId}`)
    const post = await this.postModel.findById(postId).exec()
    
    if (!post) {
      this.logger.warn(`Post not found: ${postId}`)
      throw new NotFoundException(`Post with ID ${postId} not found`)
    }
    
    return post
  }

  async getUserPosts(userId: string): Promise<TPostDocument[]> {
    this.logger.log(`Fetching posts for user: ${userId}`)
    return this.postModel.find({ authorId: userId }).sort({ createdAt: -1 }).exec()
  }

  async deletePost(postId: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({
      _id: postId,
    })
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found`)
    }
    
    return true
  }
} 