import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

import { Post, TPostDocument } from '@/schemas'
import { CreatePostDto, GeneratePostDto, UpdatePostDto } from '@/dto'
import { EnvironmentVariables } from '@/types'

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name)
  private openai: OpenAI

  constructor(
    @InjectModel(Post.name)
    private postModel: Model<TPostDocument>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<EnvironmentVariables['OPENAI_API_KEY']>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    this.openai = new OpenAI({ apiKey })
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

  async generatePost(userId: string, generatePostDto: GeneratePostDto): Promise<TPostDocument> {
    this.logger.log(`Generating post on topic "${generatePostDto.topic}" in style "${generatePostDto.style}" for user: ${userId}`)

    const prompt = `Generate a blog post about "${generatePostDto.topic}" in a "${generatePostDto.style}" style.
The output should be in JSON format with two keys: "title" (string) and "content" (string, Markdown formatted text).`

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      })

      const result = response.choices[0]?.message?.content

      if (!result) {
        this.logger.error('OpenAI response content is empty or null')
        throw new Error('Failed to generate content from OpenAI')
      }

      let parsedResult: { title: string; content: string }
      try {
        parsedResult = JSON.parse(result)
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI JSON response:', result, parseError)
        parsedResult = {
          title: generatePostDto.topic,
          content: result
        }
      }

      const { title, content } = parsedResult

      if (!title || !content) {
        this.logger.error('Parsed OpenAI response lacks title or content:', parsedResult)
        throw new Error('Invalid content structure received from OpenAI')
      }

      const createPostDto: CreatePostDto = {
        title,
        content,
        topic: generatePostDto.topic,
        style: generatePostDto.style,
        status: 'draft',
      }

      this.logger.log(`Successfully generated content for topic: ${generatePostDto.topic}`)
      const savedPost = await this.createPost(userId, createPostDto)
      return savedPost

    } catch (error) {
      this.logger.error(`Error generating post with OpenAI for topic "${generatePostDto.topic}":`, error)
      throw new Error(`Failed to generate post: ${error.message}`)
    }
  }
} 