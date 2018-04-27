export interface IAuthorizeSession {
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