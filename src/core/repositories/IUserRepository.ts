import { IGet, ISave } from "./IRepository";
import { IUser } from "../models/IUser";

export interface IUserRepository extends IGet<IUser, string> {}
