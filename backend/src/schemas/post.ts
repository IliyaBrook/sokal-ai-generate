import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { schemaOptions } from '.'

export type TPostDocument = HydratedDocument<Post> & {
  id: string
}

@Schema(schemaOptions)
export class Post {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  content: string

  @Prop({ required: true })
  topic: string

  @Prop({ required: true })
  style: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  authorId: string

  @Prop({ default: false })
  isPublished: boolean

  @Prop({ type: Date })
  createdAt: Date

  @Prop({ type: Date })
  updatedAt: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)

PostSchema.virtual('id').get(function() {
  return this._id.toString()
})

PostSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() })
}) 