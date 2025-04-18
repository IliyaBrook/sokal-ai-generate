export type IUserRoleOp = 'user' | 'admin'
export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  password?: string
  posts?: string[];
  role?: IUserRoleOp;
  createdAt: Date
  updatedAt: Date
}