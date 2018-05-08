import { IAuthorizationCode } from '../models/IAuthorizationCode';
import { IDelete, IGet, ISave } from './IRepository';

export interface IAuthorizationCodeRepository extends ISave<IAuthorizationCode>, IGet<IAuthorizationCode, string>, IDelete<string> {
}