import { IUser } from '../models/IUser';
import { IGet, ISave } from './IRepository';

export interface IUserRepository extends IGet<IUser, string>, ISave<IUser> {}
