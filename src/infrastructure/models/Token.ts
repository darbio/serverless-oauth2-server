import * as uuid from 'uuid/v4';
import * as moment from 'moment'
import * as jsonwebtoken from 'jsonwebtoken';

import {
    IToken
} from "../../core/IModel";

export class Token implements IToken {
    get id(): string {
        return this._id
    }
    private _id: string

    get type(): 'access' | 'id' {
        return this._type
    }
    private _type: 'access' | 'id'

    get subject(): string {
        return this._subject
    }
    private _subject: string

    get clientId(): string {
        return this._clientId
    }
    private _clientId: string

    get claims(): {
        [key: string]: string;
    } {
        return this._claims
    }
    private _claims: {
        [key: string]: string;
    }

    get created(): Date {
        return this._created
    }
    private _created: Date

    get expires(): Date {
        return this._expires
    }
    private _expires: Date

    static create(params: {
        type: 'access' | 'id',
        subject: string,
        clientId: string,
        claims?: {
            [key: string]: string
        }
    }): Token {
        let token = new Token()

        token._id = uuid()
        token._type = params.type
        token._subject = params.subject
        token._clientId = params.clientId
        token._claims = params.claims
        token._created = new Date()
        token._expires = moment(token._created).add(1, 'h').toDate()

        return token;
    }

    /**
     * Returns if this autorization code is still valid
     */
    isValid(): boolean {
        return this._expires > new Date()
    }

    /**
     * Returns the token as a JWT
     * @param secret 
     */
    toJwt(secret: string): string {
        let payload = {
            sub: this.subject,
            aud: this.clientId,
            iat: new Date().getTime(),
            exp: moment(moment().add(1, 'h')).unix(),
            iss: 'https://idp.darb.io',
            token_id: this.id
        }
        // Assign custom claims
        Object.assign(payload, this.claims)

        return jsonwebtoken.sign(payload, secret)
    }
}