import * as crypto from "crypto";
import * as moment from "moment";

import { IAuthorizationCode } from "../../core/models/IAuthorizationCode";

export class AuthorizationCode implements IAuthorizationCode {
    get id(): string {
        return this._id;
    }
    private _id: string;

    get clientId(): string {
        return this._clientId;
    }
    private _clientId: string;

    get redirectUri(): string {
        return this._redirectUri;
    }
    private _redirectUri: string;

    get subject(): string {
        return this._subject;
    }
    private _subject: string;

    get created(): Date {
        return this._created;
    }
    private _created: Date;

    get expires(): Date {
        return this._expires;
    }
    private _expires: Date;

    static create(params: {
        subject: string;
        clientId: string;
        redirectUrl: string;
    }): AuthorizationCode {
        let code = new AuthorizationCode();

        code._id = crypto.randomBytes(16).toString("hex");
        code._clientId = params.clientId;
        code._redirectUri = params.redirectUrl;
        code._subject = params.subject;
        code._created = new Date();
        code._expires = moment(code._created)
            .add(5, "m")
            .toDate();

        return code;
    }

    /**
     * Returns if this autorization code is still valid
     */
    isValid(): boolean {
        return this._expires > new Date();
    }
}
