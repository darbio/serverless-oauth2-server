import { IGet, ISave } from "./IRepository";
import { ISession } from "../models/ISession";

export interface ISessionRepository
    extends ISave<ISession>,
        IGet<ISession, string> {}
