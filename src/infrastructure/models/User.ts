import { IUser, IExternalUser, IInternalUser } from "../../core/models/IUser";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid/v4";

export abstract class User implements IUser {
    get id(): string {
        return this._id;
    }
    protected _id: string;

    get claims(): { [key: string]: string } {
        return this._claims;
    }
    protected _claims: { [key: string]: string };

    abstract type: "internal" | "external";
}

export class ExternalUser extends User implements IExternalUser {
    private _provider: string;
    public get provider(): string {
        return this._provider;
    }

    private _refreshToken: string;
    public get refreshToken(): string {
        return this._refreshToken;
    }

    type: "external" = "external";

    /**
     * Creates a user from an external provider
     * @param params
     */
    static create(params: {
        username: string;
        provider: string;
        refreshToken: string;
    }): User {
        let user = new ExternalUser();
        user._id = params.username;
        user._provider = params.provider;
        user._refreshToken = params.refreshToken;
        return user;
    }
}

export class InternalUser extends User implements IInternalUser {
    private _passwordHash: string;
    type: "internal" = "internal";

    /**
     * Compares a password to the stored hash
     * @param password
     */
    login(password: string): boolean {
        return bcrypt.compareSync(password, this._passwordHash);
    }

    /**
     * Creates a new user with the specified username and password
     * @param params
     */
    static create(params: {
        username: string;
        password: string;
        claims?: { [key: string]: string };
    }): InternalUser {
        let user = new InternalUser();
        user._id = params.username; // TODO MD5 hash the username
        user._passwordHash = bcrypt.hashSync(params.password, 10);
        return user;
    }
}
