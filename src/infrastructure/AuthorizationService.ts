import * as validator from 'validator';
import * as uuid from 'uuid/v4';

import { IAuthorizationService } from "../core/IAuthorizationService";
import { IAuthorizationSessionRepository } from '../core/ISessionRepository';
import { IAuthorizeSession } from '../core/IModel';

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

    private _loginUrl: string = 'http://www.google.com.au'

    _sessionRepository: IAuthorizationSessionRepository;

    constructor(params: IAuthorizationServiceParams, sessionRepository: IAuthorizationSessionRepository) {
        // Params
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

        // Dependency injection
        this._sessionRepository = sessionRepository
    }

    public initiate(): string {
        // Create a session
        // This is used to co-ordinate between calls to the stateless provider
        const session: IAuthorizeSession = {
            id: uuid(),
            responseType: this._responseType,
            clientId: this._clientId,
            clientSecret: this._clientSecret,
            redirectUri: this._redirectUri,
            scopes: this._scopes,
            state: this._state
        }

        // Persist the session
        this._sessionRepository.save(session);

        // Set the url to our login server
        return `${this._loginUrl}?session=${session.id}`;
    }
}