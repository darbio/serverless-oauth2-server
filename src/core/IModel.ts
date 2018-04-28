export interface IUser {
    id: string
    isValid(): boolean
}

export interface IAuthorizationCode {
    id: string
    subject: string
    clientId: string
    redirectUri: string
    created: Date
    expires: Date

    isValid(): boolean
}

export interface ISession {
    id: string,
    clientId: string,
    responseType: 'code' | 'token'
    redirectUri: string
    state?: string
    created: Date
    expires: Date

    getLoginUrl(): string
    isValid(): boolean
}

export interface IToken {
    id: string
    type: 'access' | 'id'
    subject: string
    clientId: string
    claims: {
        [key: string]: string;
     }
    created: Date
    expires: Date

    toJwt(secret: string): string
}