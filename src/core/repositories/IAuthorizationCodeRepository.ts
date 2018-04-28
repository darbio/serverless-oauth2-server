import { IDelete, ISave, IGet } from './IRepository';
import { IAuthorizationCode } from '../models/IAuthorizationCode';

export interface IAuthorizationCodeRepository extends ISave<IAuthorizationCode>, IGet<IAuthorizationCode, string>, IDelete<string> {
}