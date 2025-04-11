export interface IPost {
    id: string;
    title: string;
    content: string;
    topic: string;
    style: string;
    authorId: string;
    isPublished: boolean;
    scheduledPublishDate?: Date;
    shortLink?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IGeneratePostData {
    topic: string;
    style: string;
}
export interface ICreatePostData {
    title: string;
    content: string;
    topic: string;
    style: string;
    isPublished?: boolean;
    scheduledPublishDate?: Date | string;
}
export interface IUpdatePostData {
    title?: string;
    content?: string;
    topic?: string;
    style?: string;
    isPublished?: boolean;
    scheduledPublishDate?: Date | null;
}
