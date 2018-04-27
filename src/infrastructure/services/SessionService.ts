import { ISessionService } from "../../core/services/ISessionService";
import { ISession } from "../../core/IModel";

import * as uuid from 'uuid/v4'
import { Session } from "../models/Session";

export class SessionService implements ISessionService {

    /**
     * Creates a new session for the authorization lifecycle
     * @param params 
     */
    async createSession(params: {
        responseType: 'code' | 'token',
        redirectUri: string,
        state?: string
    }): Promise<ISession> {
        return Session.Create({
            responseType: params.responseType,
            redirectUri: params.redirectUri,
            state: params.state
        })
    }
}