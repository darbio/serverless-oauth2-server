import * as uuid from "uuid/v4";

import { IClient } from "../../core/models/IClient";

export class Client implements IClient {
    get id(): string {
        return this._id;
    }
    private _id: string;

    get secret(): string | undefined {
        return this._secret;
    }
    private _secret?: string;

    private _jwtSecret: string;
    public get jwtSecret(): string {
        return this._jwtSecret;
    }

    get redirectUris(): string[] | undefined {
        return this._redirectUris;
    }
    private _redirectUris?: string[];

    get grantType(): string {
        return this._grantType;
    }
    private _grantType: string;

    static create(params: {
        grantType: "code" | "token" | "password";
        jwtSecret: string;
        secret?: string;
        redirectUris?: string[];
    }): Client {
        let client = new Client();
        client._id = uuid();
        client._grantType = params.grantType;
        client._jwtSecret = params.jwtSecret;

        if (params.grantType === "code" || params.grantType == "token") {
            client._redirectUris = params.redirectUris;
        }

        if (params.secret) {
            client._secret = params.secret;
        }

        return client;
    }
}
