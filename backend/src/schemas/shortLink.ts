import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { schemaOptions } from '.'

export type TShortLinkDocument = HydratedDocument<ShortLink> & {
  id: string
}

@Schema(schemaOptions)
export class ShortLink {
  @Prop({ required: true, unique: true })
  code: string

  @Prop({ required: true, enum: ['post', 'other'] })
  targetType: string

  @Prop({ required: true })
  targetId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: string

  @Prop({ type: Date })
  expiresAt: Date

  @Prop({ type: Date })
  createdAt: Date

  @Prop({ type: Date })
  updatedAt: Date
}

export const ShortLinkSchema = SchemaFactory.createForClass(ShortLink)

ShortLinkSchema.virtual('id').get(function() {
  return this._id.toString()
})

ShortLinkSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() })
})
ShortLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) 