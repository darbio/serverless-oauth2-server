import * as moment from "moment";
import * as uuid from "uuid/v4";

import { ISession } from "../../core/models/ISession";

export class Session implements ISession {
    get id(): string {
        return this._id;
    }
    private _id: string;

    get clientId(): string {
        return this._clientId;
    }
    private _clientId: string;

    get responseType(): "code" | "token" {
        return this._responseType;
    }
    private _responseType: "code" | "token";

    get redirectUri(): string {
        return this._redirectUri;
    }
    private _redirectUri: string;

    get state(): string {
        return this._state;
    }
    private _state?: string;

    get created(): Date {
        return this._created;
    }
    private _created: Date;

    get expires(): Date {
        return this._expires;
    }
    private _expires: Date;

    private _provider: string;
    public get provider(): string {
        return this._provider;
    }

    /**
     * Creates a new session
     * @param params
     */
    static Create(params: {
        clientId: string;
        responseType: "code" | "token";
        redirectUri: string;
        state: string;
    }): Session {
        let session = new Session();
        session._id = uuid();
        session._clientId = params.clientId;
        session._responseType = params.responseType;
        session._redirectUri = params.redirectUri;
        session._state = params.state;
        session._created = new Date();
        session._expires = moment(session._created)
            .add(5, "m")
            .toDate();
        return session;
    }

    /**
     * Returns whether the session is still valid
     */
    isValid(): boolean {
        return this._expires > new Date();
    }

    /**
     * Gets the login url for this session
     */
    getLoginUrl(): string {
        return `http://localhost:4200/login?session=${this.id}`;
    }
}
