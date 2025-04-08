import type { IUser } from './user.types';
import { Types } from 'mongoose';

export interface ITokenData {
  accessToken: string;
  refreshToken: string;
}

export interface IDecodedTokenData {
  id: string;
  user: Types.ObjectId & IUser;
  refreshToken: string;
  accessToken: string;
}
