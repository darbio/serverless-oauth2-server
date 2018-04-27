import { ISession, IAuthorizationCode } from "../../core/IModel";
import * as uuid from 'uuid/v4';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { AuthorizationCode } from "./AuthorizationCode";

export class Session implements ISession {
    get id(): string {
        return this._id;
    }
    private _id: string

    get responseType(): 'code' | 'token' {
        return this._responseType;
    }
    private _responseType: 'code' | 'token'

    get redirectUri(): string {
        return this._redirectUri;
    }
    private _redirectUri: string

    get state(): string {
        return this._state
    }
    private _state?: string

    get created(): Date {
        return this._created;
    }
    private _created: Date

    get expires(): Date {
        return this._expires
    }
    private _expires: Date

    /**
     * Creates a new session
     * @param params 
     */
    static Create(params: {
        responseType: 'code' | 'token',
        redirectUri: string,
        state: string
    }): Session {
        let session = new Session();
        session._id = uuid();
        session._responseType = params.responseType
        session._redirectUri = params.redirectUri
        session._state = params.state
        session._created = new Date()
        session._expires = moment(session._created).add(1, 'h').toDate()
        return session;
    }

    isValid(): boolean {
        return new Date() > this._expires
    }

    /**
     * Gets the login url for this session
     */
    getLoginUrl(): string {
        return `/login?session=${this.id}`
    }
}