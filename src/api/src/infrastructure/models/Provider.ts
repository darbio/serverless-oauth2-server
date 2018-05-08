import { IProvider } from "../../core/models/IProvider";

export class Provider implements IProvider {
    private _id: string;
    get id(): string {
        return this._id;
    }

    private _clientId: string;
    public get clientId(): string {
        return this._clientId;
    }

    private _clientSecret: string;
    public get clientSecret(): string {
        return this._clientSecret;
    }

    private _authorizationUrl: string;
    public get authorizationUrl(): string {
        return this._authorizationUrl;
    }

    private _tokenUrl: string;
    public get tokenUrl(): string {
        return this._tokenUrl;
    }

    private _profileUrl: string;
    public get profileUrl(): string {
        return this._profileUrl;
    }

    private _scope: string[];
    public get scope(): string[] {
        return this._scope;
    }
}
