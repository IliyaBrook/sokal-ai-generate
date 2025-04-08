export interface IUser {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    role: TUserRoles;
    password?: string;
    posts?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export type TUserRoles = 'admin' | 'user';
export interface IRefreshToken {
    token: string;
    user: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
