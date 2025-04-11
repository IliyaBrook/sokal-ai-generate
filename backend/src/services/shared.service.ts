import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { Post, TPostDocument } from '@/schemas'
import { User, TUserDocument } from '@/schemas'
import { ShortLink, TShortLinkDocument } from '@/schemas'

@Injectable()
export class SharedService {
  constructor(
    @InjectModel(ShortLink.name)
    private shortLinkModel: Model<TShortLinkDocument>,
    @InjectModel(Post.name)
    private postModel: Model<TPostDocument>,
    @InjectModel(User.name)
    private userModel: Model<TUserDocument>,
  ) {}

  async getSharedContent(code: string) {
    const shortLink = await this.shortLinkModel.findOne({ code }).exec()
    if (!shortLink) {
      throw new NotFoundException('Short link not found')
    }

    if (shortLink.expiresAt < new Date()) {
      throw new NotFoundException('Link has expired')
    }

    const post = await this.postModel.findById(shortLink.targetId).exec()
    if (!post) {
      throw new NotFoundException('Post not found')
    }

    const creator = await this.userModel.findById(shortLink.creator).select('id firstName lastName email').exec()
    if (!creator) {
      throw new NotFoundException('Creator not found')
    }

    return {
      post,
      creator
    }
  }
} 