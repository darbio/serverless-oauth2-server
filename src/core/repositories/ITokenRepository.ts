import { IGet, ISave } from "./IRepository";
import { IToken } from "../models/IToken";

export interface ITokenRepository extends ISave<IToken> {}
