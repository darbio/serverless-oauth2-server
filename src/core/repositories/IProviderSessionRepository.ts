import { IProviderSession } from '../models/IProviderSession';
import { IGet, ISave } from './IRepository';

export interface IProviderSessionRepository
    extends IGet<IProviderSession, string>,
        ISave<IProviderSession> {}
