import { ISession } from "../IModel";
import { IGet, ISave } from "./IRepository";

export interface ISessionRepository extends ISave<ISession>, IGet<ISession, string> {

}