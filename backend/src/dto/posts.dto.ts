import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { IPost, ICreatePostData, IGeneratePostData, IUpdatePostData } from '@sokal_ai_generate/shared-types'

export class PostDto implements IPost {
  @Expose()
  id: string

  @Expose()
  title: string

  @Expose()
  content: string

  @Expose()
  topic: string

  @Expose()
  style: string

  @Expose()
  authorId: string

  @Expose()
  isPublished: boolean

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date

  constructor(post: IPost) {
    this.id = post.id
    this.title = post.title
    this.content = post.content
    this.topic = post.topic
    this.style = post.style
    this.authorId = post.authorId
    this.isPublished = post.isPublished
    this.createdAt = post.createdAt
    this.updatedAt = post.updatedAt
  }
}

export class CreatePostDto implements ICreatePostData {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  topic: string

  @IsString()
  @IsNotEmpty()
  style: string

  @IsString()
  @IsOptional()
  status?: string

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean
}

export class UpdatePostDto implements IUpdatePostData {
  @IsString()
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @IsOptional()
  topic?: string

  @IsString()
  @IsOptional()
  style?: string

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean
}

export class GeneratePostDto implements IGeneratePostData {
  @IsString()
  @IsNotEmpty()
  topic: string

  @IsString()
  @IsNotEmpty()
  style: string
} 