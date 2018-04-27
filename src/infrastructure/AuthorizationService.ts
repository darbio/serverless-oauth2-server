import * as validator from 'validator'
import * as uuid from 'uuid/v4'
import * as bcrypt from 'bcrypt'

import { IAuthorizationService } from "../core/IAuthorizationService"
import { IAuthorizationSessionRepository } from '../core/ISessionRepository'
import { IAuthorizationSession } from '../core/IModel'

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
    private _loginUrl: string;

    private _sessionId: string = uuid();

    _sessionRepository: IAuthorizationSessionRepository;

    constructor(sessionRepository: IAuthorizationSessionRepository) {
        this._sessionRepository = sessionRepository
    }

    public async init(params: IAuthorizationServiceParams): Promise<void> {
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

        // Create a session
        // This is used to co-ordinate between calls to the stateless provider
        const session: IAuthorizationSession = {
            id: this._sessionId,
            responseType: this._responseType,
            clientId: this._clientId,
            clientSecret: this._clientSecret,
            redirectUri: this._redirectUri,
            scopes: this._scopes,
            state: this._state
        }

        // Persist the session
        await this._sessionRepository.save(session);

        // Set the url to our login server
        this._loginUrl = `/login?session=${session.id}`;
    }

    async loadFromSession(sessionId: string) {
        const session = await this._sessionRepository.get(sessionId);

        this._sessionId = session.id
        this._clientId = session.clientId
        this._clientSecret = session.clientSecret
        this._redirectUri = session.redirectUri
        this._responseType = session.responseType
        this._scopes = session.scopes
        this._state = session.state
    }

    public async generateAuthorizationCode(): Promise<string> {
        return await bcrypt.hash(uuid(), 6);
    }

}