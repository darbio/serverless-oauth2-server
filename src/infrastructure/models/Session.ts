import { ISession, IAuthorizationCode } from "../../core/IModel";
import * as bcrypt from 'bcrypt';

export class Session implements ISession {
    id: string
    responseType: 'code' | 'token'
    redirectUri: string
    state?: string

    constructor(params: ISession) {
        this.id = params.id
        this.responseType = params.responseType
        this.redirectUri = params.redirectUri
        this.state = params.state
    }

    getLoginUrl(): string {
        return `/login?session=${this.id}`
    }

    generateAuthCode(subject: string): IAuthorizationCode {
        return {
            id: bcrypt.hashSync(this.id, 6),
            subject: subject
        }
    }
}