import { IProvider } from '../models/IProvider';
import { IGet } from './IRepository';

export interface IProviderRepository extends IGet<IProvider, string> {}
