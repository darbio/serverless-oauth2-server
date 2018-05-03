import { IGet, ISave } from "./IRepository";
import { IUserToken } from "../models/IToken";

export interface ITokenRepository extends ISave<IUserToken> {}
