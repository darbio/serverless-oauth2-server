import { IAuthorizationSession } from './IModel';
import { save, get } from './IRepository';

export interface IAuthorizationSessionRepository extends save<IAuthorizationSession>, get<IAuthorizationSession, string> {
}