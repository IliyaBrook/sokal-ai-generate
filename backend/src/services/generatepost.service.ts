import { CreatePostDto, GeneratePostDto } from '@/dto';
import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@/types';

@Injectable()
export class GeneratePostService {
    private readonly logger = new Logger(GeneratePostService.name)
    private openai: OpenAI

    constructor(
        private readonly configService: ConfigService,
    ) {
        const apiKey = this.configService.get<EnvironmentVariables['OPENAI_API_KEY']>('OPENAI_API_KEY')
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not configured')
        }
        this.openai = new OpenAI({ apiKey })
    }

    async generatePost(userId: string, generatePostDto: GeneratePostDto): Promise<CreatePostDto> {
        this.logger.log(`Generating post on topic "${generatePostDto.topic}" in style "${generatePostDto.style}" for user: ${userId}`)
    
        const prompt = `
        Generate a blog post about "${generatePostDto.topic}" in a "${generatePostDto.style}" style.
        The output should be in JSON format with two keys: 
        "title" (string) and "content" (string, Markdown formatted text).
        `
    
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
            isPublished: false,
          }
    
          this.logger.log(`Successfully generated content for topic: ${generatePostDto.topic}`)
       
          return createPostDto
    
        } catch (error) {
          this.logger.error(`Error generating post with OpenAI for topic "${generatePostDto.topic}":`, error)
          throw new Error(`Failed to generate post: ${error.message}`)
        }
      }
}