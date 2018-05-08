import * as crypto from "crypto";
import * as jsonwebtoken from "jsonwebtoken";
import * as moment from "moment";
import * as uuid from "uuid/v4";

import { IUserToken } from "../../core/models/IToken";
import { IUser } from "../../core/models/IUser";

export class UserToken implements IUserToken {
    get id(): string {
        return this._id;
    }
    private _id: string;

    private _user: IUser;
    public get user(): IUser {
        return this._user;
    }

    get type(): "access" | "id" {
        return this._type;
    }
    private _type: "access" | "id";

    get clientId(): string {
        return this._clientId;
    }
    private _clientId: string;

    get created(): Date {
        return this._created;
    }
    private _created: Date;

    get expires(): Date {
        return this._expires;
    }
    private _expires: Date;

    private _issuer: string;
    public get issuer(): string {
        return this._issuer;
    }

    /**
     * Creates a user token
     * @param params
     */
    static create(params: {
        type: "access" | "id";
        clientId: string;
        user: IUser;
        issuer: string;
    }): UserToken {
        let token = new UserToken();

        token._id = uuid();
        token._user = params.user;
        token._type = params.type;
        token._clientId = params.clientId;
        token._issuer = params.issuer;
        token._created = new Date();
        token._expires = moment(token._created)
            .add(1, "h")
            .toDate();

        return token;
    }

    /**
     * Returns if this autorization code is still valid
     */
    isValid(): boolean {
        return this._expires > new Date();
    }

    /**
     * Returns the token as a JWT
     * @param secret
     */
    toJwt(secret: string): string {
        let payload: any = {
            sub: this.user.id,
            aud: this.clientId,
            iat: moment(new Date()).unix(),
            exp: moment(moment().add(1, "h")).unix(),
            iss: this.issuer,
            jti: this.id
        };
        if (this.type === "id") {
            Object.assign(payload, {
                email: this.user.emailAddress,
                email_verified: this.user.emailVerified,

                name: this.user.name,
                given_name: this.user.givenName,
                family_name: this.user.familyName,

                picture:
                    this.user.pictureUrl ||
                    `https://www.gravatar.com/avatar/${this.md5(
                        this.user.emailAddress
                    )}`
            });
        }

        return jsonwebtoken.sign(payload, secret);
    }

    private md5(input: string): string {
        return crypto
            .createHash("md5")
            .update(input)
            .digest("hex");
    }
}
