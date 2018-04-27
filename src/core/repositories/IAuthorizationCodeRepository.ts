import { IAuthorizationCode } from '../IModel';
import { ISave, IGet } from './IRepository';

export interface IAuthorizationCodeRepository extends ISave<IAuthorizationCode>, IGet<IAuthorizationCode, string> {
}