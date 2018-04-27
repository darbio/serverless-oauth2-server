import { IAuthorizationSessionRepository } from "../core/ISessionRepository";
import { IAuthorizeSession } from "../core/IModel";

export class AuthorizationSessionRepository implements IAuthorizationSessionRepository {
    sessions: IAuthorizeSession[] = [];

    async get(id: string): Promise<IAuthorizeSession> {
        const index = this.sessions.findIndex((session) => { return session.id === id})
        return Promise.resolve(this.sessions[index]);
    }

    async save(session: IAuthorizeSession): Promise<void>{
        this.sessions.push(session);
    }
}