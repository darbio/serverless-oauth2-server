export interface IAuthorizationSession {
    id: string,
    responseType: 'code' | 'token'
    clientId: string
    clientSecret?: string
    redirectUri: string
    scopes?: string[]
    state?: string
}

export interface IUser {
    id: string
    isValid(): boolean
}

export interface IAuthorizationCode {
    id: string
    subject: string
}

export interface ISession {
    id: string,
    responseType: 'code' | 'token'
    redirectUri: string
    state?: string

    getLoginUrl(): string
    generateAuthCode(subject: string): IAuthorizationCode
}