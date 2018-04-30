import { IGet } from "./IRepository";
import { IClient } from "../models/IClient";

export interface IClientRepository extends IGet<IClient, string> {}
