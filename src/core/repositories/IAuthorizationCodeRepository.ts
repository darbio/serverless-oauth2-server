import { IAuthorizationCode } from '../IModel';
import { IDelete, ISave, IGet } from './IRepository';

export interface IAuthorizationCodeRepository extends ISave<IAuthorizationCode>, IGet<IAuthorizationCode, string>, IDelete<string> {
}