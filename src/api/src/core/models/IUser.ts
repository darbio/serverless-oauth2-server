export interface IUser {
    id: string;
    identities: IIdentity[];

    emailAddress: string;
    emailVerified: boolean;

    name: string;
    givenName: string;
    familyName: string;

    pictureUrl?: string;

    hasInternalIdentity(): boolean;
    getInternalIdentity(): IInternalIdentity;

    hasIdentityFromExternalProvider(params: { provider: string }): boolean;
    addInternalIdentity(identity: IInternalIdentity);
    addExternalIdentity(identity: IExternalIdentity);
}

export interface IIdentity {
    sub: string;
    type: "internal" | "external";
}

export interface IInternalIdentity extends IIdentity {
    login(password: string): boolean;
}

export interface IExternalIdentity extends IIdentity {
    provider: string;
}
