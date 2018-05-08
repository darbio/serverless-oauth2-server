import { IUserToken } from '../models/IToken';
import { ISave } from './IRepository';

export interface ITokenRepository extends ISave<IUserToken> {}
