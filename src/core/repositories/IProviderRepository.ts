import { IGet } from "./IRepository";
import { IProvider } from "../models/IProvider";

export interface IProviderRepository extends IGet<IProvider, string> {}
