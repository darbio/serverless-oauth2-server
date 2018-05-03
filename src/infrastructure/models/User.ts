import {
    IUser,
    IIdentity,
    IInternalIdentity,
    IExternalIdentity
} from "../../core/models/IUser";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid/v4";

export class User implements IUser {
    get id(): string {
        return this._id;
    }
    protected _id: string;

    private _identities: IIdentity[];
    public get identities(): IIdentity[] {
        if (!this._identities) {
            this._identities = [];
        }
        return this._identities;
    }

    /**
     * Creates a user with a username and password identity
     * @param params
     */
    static createInternalUser(params: { username: string; password: string }) {
        let user = new User();
        user._id = params.username;

        let identity = InternalIdentity.create({
            sub: params.username,
            password: params.password
        });
        user.addInternalIdentity(identity);

        return user;
    }

    /**
     * Creates a user with details from an external provider
     * @param params
     */
    static createExternalUser(params: {
        username: string;
        provider: string;
        refreshToken: string;
    }) {
        let user = new User();
        user._id = params.username;

        let identity = ExternalIdentity.create({
            sub: params.username,
            provider: params.provider,
            refreshToken: params.refreshToken
        });
        user.addExternalIdentity(identity);

        return user;
    }

    /**
     * Adds an identity with a username and password
     * @param identity
     */
    addInternalIdentity(identity: IInternalIdentity) {
        if (!this._identities) {
            this._identities = [];
        }
        this._identities.push(identity);
    }

    /**
     * Adds an identity provided by an external provider
     * @param identity
     */
    addExternalIdentity(identity: IExternalIdentity) {
        if (!this._identities) {
            this._identities = [];
        }
        if (this.identities.filter(a => a.type === "internal").length > 0) {
            throw new Error("Only one internal identity can exist on a user");
        }
        this._identities.push(identity);
    }

    /**
     * Checks if the provider already exists
     * @param params
     * @returns true or false
     */
    hasIdentityFromExternalProvider(params: { provider: string }): boolean {
        return (
            this.identities.filter(a => {
                if (a.type == "external") {
                    let typed = a as ExternalIdentity;
                    return typed.provider === params.provider;
                }
                return false;
            }).length > 0
        );
    }

    /**
     * Checks if this user has an internal identity
     * @returns true or false
     */
    hasInternalIdentity(): boolean {
        return (
            this.identities.filter(a => {
                return a.type === "internal";
            }).length > 0
        );
    }

    /**
     * Gets the internal identity for this user
     */
    getInternalIdentity(): InternalIdentity {
        if (!this.hasInternalIdentity()) {
            throw new Error("User does not have an internal identity");
        }
        return this.identities.filter(a => {
            return a.type === "internal";
        })[0] as InternalIdentity;
    }
}

abstract class Identity implements IIdentity {
    protected _sub: string;
    public get sub(): string {
        return this._sub;
    }

    abstract type: "internal" | "external";
}

export class InternalIdentity extends Identity implements IInternalIdentity {
    type: "internal" = "internal";

    private _passwordHash: string;

    static create(params: {
        sub: string;
        password: string;
        claims?: { [key: string]: string };
    }): InternalIdentity {
        let identity = new InternalIdentity();
        identity._sub = params.sub;
        identity._passwordHash = bcrypt.hashSync(params.password, 10);
        return identity;
    }

    /**
     * Compares a password to the stored hash
     * @param password
     */
    login(password: string): boolean {
        return bcrypt.compareSync(password, this._passwordHash);
    }
}

export class ExternalIdentity extends Identity implements IExternalIdentity {
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
        sub: string;
        provider: string;
        refreshToken: string;
    }): ExternalIdentity {
        let identity = new ExternalIdentity();
        identity._sub = params.sub;
        identity._provider = params.provider;
        identity._refreshToken = params.refreshToken;
        return identity;
    }
}
