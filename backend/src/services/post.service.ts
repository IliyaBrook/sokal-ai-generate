import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Post, TPostDocument } from '@/schemas'
import { CreatePostDto, GeneratePostDto, UpdatePostDto } from '@/dto'

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<TPostDocument>,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<TPostDocument> {
    const post = new this.postModel({
      ...createPostDto,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return post.save()
  }

  async updatePost(
    postId: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<TPostDocument> {
    const post = await this.postModel.findOne({
      _id: postId,
      authorId: userId,
    })

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found or you don't have permission`)
    }

    Object.assign(post, {
      ...updatePostDto,
      updatedAt: new Date(),
    })

    return post.save()
  }

  async getPostById(postId: string): Promise<TPostDocument> {
    const post = await this.postModel.findById(postId)
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`)
    }
    
    return post
  }

  async getUserPosts(userId: string): Promise<TPostDocument[]> {
    return this.postModel.find({ authorId: userId }).sort({ createdAt: -1 })
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const result = await this.postModel.deleteOne({
      _id: postId,
      authorId: userId,
    })
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Post with ID ${postId} not found or you don't have permission`)
    }
    
    return true
  }

  async generatePost(generatePostDto: GeneratePostDto): Promise<{ title: string; content: string }> {
    // Заглушка, будет заменена на реальную интеграцию с OpenAI
    const title = `Generated post about ${generatePostDto.topic}`
    const content = `This is a generated content about ${generatePostDto.topic} in ${generatePostDto.style} style.`
    
    return { title, content }
  }
} 