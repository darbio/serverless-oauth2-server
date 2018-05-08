import { IClient } from '../models/IClient';
import { IGet } from './IRepository';

export interface IClientRepository extends IGet<IClient, string> {}
