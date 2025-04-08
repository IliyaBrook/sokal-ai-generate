export interface IPost {
    id: string;
    title: string;
    content: string;
    topic: string;
    style: string;
    authorId: string;
    isPublished: boolean;
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
}
export interface IUpdatePostData {
    title?: string;
    content?: string;
    topic?: string;
    style?: string;
    isPublished?: boolean;
}
