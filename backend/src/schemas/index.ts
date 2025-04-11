import { SchemaOptions } from '@nestjs/mongoose'

export const schemaOptions: SchemaOptions = {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret._id
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret._id
    },
  },
  timestamps: true,
}

export * from './user'
export * from './refreshToken'
export * from './post'
export * from './shortLink'
