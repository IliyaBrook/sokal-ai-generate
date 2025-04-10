import { Post } from '@/schemas'
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Model } from 'mongoose'

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    const now = new Date()
    this.logger.log(`Checking for scheduled posts to publish at ${now.toISOString()}`)
    
    try {
      const posts = await this.postModel.find({
        isPublished: false,
        scheduledPublishDate: { $lte: now },
      })
      
      if (posts.length > 0) {
        this.logger.log(`Found ${posts.length} posts to publish`)
        
        for (const post of posts) {
          await this.postModel.findByIdAndUpdate(
            post._id,
            { 
              isPublished: true,
              updatedAt: new Date() 
            },
          )
          this.logger.log(`Published post ${post._id} (scheduled for ${post.scheduledPublishDate})`)
        }
      }
    } catch (error) {
      this.logger.error('Error publishing scheduled posts', error.stack)
    }
  }
} 