import { IGet, ISave } from "./IRepository";
import { IProviderSession } from "../models/IProviderSession";

export interface IProviderSessionRepository
    extends IGet<IProviderSession, string>,
        ISave<IProviderSession> {}
