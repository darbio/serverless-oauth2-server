import * as moment from "moment";
import * as uuid from "uuid/v4";

import { IProviderSession } from "../../core/models/IProviderSession";

export class ProviderSession implements IProviderSession {
    private _id: string;
    public get id(): string {
        return this._id;
    }

    private _sessionId: string;
    public get sessionId(): string {
        return this._sessionId;
    }

    private _provider: string;
    public get provider(): string {
        return this._provider;
    }

    private _created: Date;
    public get created(): Date {
        return this._created;
    }

    private _expires: Date;
    public get expires(): Date {
        return this._expires;
    }

    static create(params: {
        provider: string;
        sessionId: string;
    }): ProviderSession {
        let providerSession = new ProviderSession();

        providerSession._id = uuid();
        providerSession._provider = params.provider;
        providerSession._sessionId = params.sessionId;
        providerSession._created = new Date();
        providerSession._expires = moment(providerSession._created)
            .add(5, "m")
            .toDate();

        return providerSession;
    }

    /**
     * Returns whether the session is still valid
     */
    isValid(): boolean {
        return this._expires > new Date();
    }
}
