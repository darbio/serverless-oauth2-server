import { DateTime } from "aws-sdk/clients/glacier";

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
    created: Date
    expires: Date
}

export interface ISession {
    id: string,
    responseType: 'code' | 'token'
    redirectUri: string
    state?: string
    created: Date
    expires: Date

    getLoginUrl(): string
}