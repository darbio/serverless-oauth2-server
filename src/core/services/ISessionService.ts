import { ISession } from "../IModel";

export interface ISessionService {
    createSession(params: {
        responseType: 'code' | 'token',
        redirectUri: string,
        state?: string
    }): Promise<ISession>
}