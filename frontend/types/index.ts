export * from './common.type'
export * from './Alert.type'

export interface Post {
  _id: string
  title: string
  content: string
  authorId: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}
