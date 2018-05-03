export interface IUser {
    id: string;
    claims: { [key: string]: string };
    type: "internal" | "external";
}

export interface IExternalUser extends IUser {
    provider: string;
    refreshToken: string;
}

export interface IInternalUser extends IUser {
    login(password: string): boolean;
}
