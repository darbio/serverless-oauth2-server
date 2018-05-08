import * as bcrypt from 'bcryptjs';

import { IExternalIdentity, IIdentity, IInternalIdentity, IUser } from '../../core/models/IUser';

export class User implements IUser {
    get id(): string {
        return this._id;
    }
    protected _id: string;

    private _emailAddress: string;
    public get emailAddress(): string {
        return this._emailAddress;
    }

    private _emailVerified: boolean;
    public get emailVerified(): boolean {
        return this._emailVerified;
    }
    public set emailVerified(v: boolean) {
        this._emailVerified = v;
    }

    private _name: string;
    public get name(): string {
        return this._name;
    }

    private _givenName: string;
    public get givenName(): string {
        return this._givenName;
    }

    private _familyName: string;
    public get familyName(): string {
        return this._familyName;
    }

    private _pictureUrl?: string;
    public get pictureUrl(): string | undefined {
        return this._pictureUrl;
    }

    private _identities: IIdentity[];
    public get identities(): IIdentity[] {
        if (!this._identities) {
            this._identities = [];
        }
        return this._identities;
    }

    private static create(params: {
        username: string;
        profile: {
            name: string;
            givenName: string;
            familyName: string;
            emailAddress: string;
            emailVerified: boolean;
            pictureUrl?: string;
        };
    }): User {
        let user = new User();
        user._id = params.username;

        user._emailAddress = params.profile.emailAddress;
        user._emailVerified = params.profile.emailVerified;

        user._name = params.profile.name;
        user._familyName = params.profile.familyName;
        user._givenName = params.profile.givenName;

        user._pictureUrl = params.profile.pictureUrl;

        return user;
    }

    /**
     * Creates a user with a username and password identity
     * @param params
     */
    static createInternalUser(params: {
        username: string;
        password: string;
        profile: {
            name: string;
            givenName: string;
            familyName: string;
            emailAddress: string;
            emailVerified: boolean;
            pictureUrl?: string;
        };
    }) {
        let user = User.create(params);
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
        provider: {
            id: string;
            sub: string;
        };
        profile: {
            name: string;
            givenName: string;
            familyName: string;
            emailAddress: string;
            emailVerified: boolean;
            pictureUrl?: string;
        };
    }) {
        let user = User.create(params);
        let identity = ExternalIdentity.create({
            sub: params.provider.sub,
            provider: params.provider.id
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
        if (this.identities.filter(a => a.type === "internal").length > 0) {
            throw new Error("Only one internal identity can exist on a user");
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
                if (a.type === "external") {
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

    type: "external" = "external";

    /**
     * Creates a user from an external provider
     * @param params
     */
    static create(params: { sub: string; provider: string }): ExternalIdentity {
        let identity = new ExternalIdentity();
        identity._sub = params.sub;
        identity._provider = params.provider;
        return identity;
    }
}
