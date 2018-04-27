import * as uuid from 'uuid/v4';
import { IAuthorizationCode } from "../../core/IModel";

export class AuthorizationCode implements IAuthorizationCode {
    get id(): string {
        return this._id
    }
    private _id: string

    get subject(): string {
        return this._subject
    }
    private _subject: string

    get created(): Date {
        return this._created
    }
    private _created: Date

    static create(params: { subject: string }): AuthorizationCode {
        let code = new AuthorizationCode()
        code._id = uuid()
        code._subject = params.subject
        code._created = new Date()
        return code;
    }
}