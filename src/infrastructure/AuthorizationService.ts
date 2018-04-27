import * as validator from 'validator';

import { IAuthorizationService } from "../core/IAuthorizationService";

export interface IAuthorizationServiceParams {
    responseType: 'code' | 'token'
    clientId: string
    clientSecret?: string
    redirectUri: string
    scopes?: string[]
    state?: string
}

export class AuthorizationService implements IAuthorizationService {
    private _responseType: 'code' | 'token'

    private _clientId: string
    private _clientSecret?: string

    private _redirectUri: string
    private _scopes?: string[]
    private _state?: string;

    get loginUrl(): string {
        return this._loginUrl
    }
    private _loginUrl: string = 'http://www.google.com.au'

    constructor(params: IAuthorizationServiceParams) {
        // Validate the repsonse type
        switch (params.responseType) {
            case 'code':
            case 'token':
                this._responseType = params.responseType
                break;
            default:
                throw new Error(`Response type ${params.responseType} not supported`)
        }

        this._clientId = params.clientId
        this._clientSecret = params.clientSecret

        // Validate redirectUrl is a URL
        if (!validator.isURL(params.redirectUri)) {
            throw new Error(`Invalid url ${params.redirectUri}`)
        }
        this._redirectUri = params.redirectUri

        this._scopes = params.scopes
        this._state = params.state
    }
}