import { IAuthorizationSession } from '../IModel';
import { ISave, IGet } from './IRepository';

export interface IAuthorizationSessionRepository extends ISave<IAuthorizationSession>, IGet<IAuthorizationSession, string> {
}