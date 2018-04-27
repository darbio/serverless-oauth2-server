import { IAuthorizationServiceParams } from "../infrastructure/AuthorizationService";

export interface IAuthorizationService {
    init(params: IAuthorizationServiceParams): Promise<void>
    
    loginUrl: string
}