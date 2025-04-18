export interface IUser {
  id: string
  email: string
  firstname: string
  lastname: string
  password?: string
  posts?: string[];
  role?: string;
  createdAt: Date
  updatedAt: Date
}