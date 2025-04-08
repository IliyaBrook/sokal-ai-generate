import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { schemaOptions } from '.'

import { TUserRoles } from '@sokal_ai_generate/shared-types'

export type TUserDocument = HydratedDocument<User> & {
  id: string
}

@Schema(schemaOptions)
export class User {
  @Prop({ required: true })
  firstname: string

  @Prop({ required: true })
  lastname: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true, enum: ['admin', 'user'] })
  role: TUserRoles

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Post' }] })
  posts: string[]

  @Prop({ type: Date })
  createdAt: Date

  @Prop({ type: Date })
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.virtual('id').get(function() {
  return this._id.toString()
})
