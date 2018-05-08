import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context
} from "aws-lambda";
import * as moment from "moment";
import * as validator from "validator";

import { Handler } from "../../core/handler";
import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { IClientRepository } from "../../core/repositories/IClientRepository";
import { ITokenRepository } from "../../core/repositories/ITokenRepository";
import { IUserRepository } from "../../core/repositories/IUserRepository";
import { UserToken } from "../models/Token";
import { AuthorizationCodeRepository } from "../repositories/AuthorizationCodeRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { TokenRepository } from "../repositories/TokenRepository";
import { UserRepository } from "../repositories/UserRepository";

export class TokenHandler extends Handler {
    async get(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        try {
            // Parameters
            const client_id = event.queryStringParameters.client_id;
            const clientSecret = event.queryStringParameters.client_secret;
            const grant_type = event.queryStringParameters.grant_type;

            // Validate client_id
            let clientRepository: IClientRepository = new ClientRepository();
            let client = await clientRepository.get(client_id);

            if (!client) {
                return this.Unauthorized(callback, {
                    error: "invalid_client",
                    error_description: "Request contains an invalid client id."
                });
            }

            // Validate client_secret
            if (clientSecret) {
                if (client.secret && clientSecret !== client.secret) {
                    return this.Unauthorized(callback, {
                        error: "invalid_client",
                        error_description:
                            "Request contains an invalid client secret."
                    });
                }
            }

            // Validate grant type supported for this client
            if (client.grantType !== grant_type) {
                return this.BadRequest(callback, {
                    error: "unsupported_grant_type",
                    error_description: `Grant type not supported`
                });
            }

            // Call handler for grant type
            switch (grant_type) {
                case "authorization_code":
                    await this.code(event, context, callback);
                default:
                    return this.BadRequest(callback, {
                        error: "unsupported_grant_type",
                        error_description: "Grant type not supported."
                    });
            }
        } catch (err) {
            return this.Error(callback, {
                error: "server_error",
                error_description: err.message
            });
        }
    }

    private async code(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        // Parameters
        const code = event.queryStringParameters.code;
        const redirect_uri = event.queryStringParameters.redirect_uri;

        // Validate code
        if (!validator.isLength(code, 32)) {
            throw new Error("Invalid authorization code");
        }

        // Get the auth_code
        const authorizationCodeRepository: IAuthorizationCodeRepository = new AuthorizationCodeRepository();
        const authorizationCode = await authorizationCodeRepository.get(code);

        if (authorizationCode === null || !authorizationCode.isValid()) {
            return this.BadRequest(callback, {
                error: "invalid_grant",
                error_description:
                    "The authorization code is invalid or expired."
            });
        }

        // Validate
        if (redirect_uri !== authorizationCode.redirectUri) {
            return this.BadRequest(callback, {
                error: "invalid_grant",
                error_description: "The redirect uri code is invalid."
            });
        }

        // Validate
        const client_id = event.queryStringParameters.client_id;
        let clientRepository: IClientRepository = new ClientRepository();
        let client = await clientRepository.get(client_id);
        if (client_id !== authorizationCode.clientId || !client) {
            return this.Unauthorized(callback, {
                error: "invalid_client",
                error_description: "Request contains an invalid client id."
            });
        }

        // Get the user
        const userRepository: IUserRepository = new UserRepository();
        const user = await userRepository.get(authorizationCode.subject);

        // Generate the access_token
        const secret = client.jwtSecret;
        let access_token = UserToken.create({
            type: "access",
            clientId: authorizationCode.clientId,
            issuer: process.env.BASE_URL,
            user: user
        });

        let id_token = UserToken.create({
            type: "id",
            issuer: process.env.BASE_URL,
            user: user,
            clientId: authorizationCode.clientId
        });

        // Save the tokens to the database
        const tokenRepository: ITokenRepository = new TokenRepository();
        await tokenRepository.save(access_token);
        await tokenRepository.save(id_token);

        // Revoke the authorization code
        await authorizationCodeRepository.delete(authorizationCode.id);

        // Response
        let response: {
            access_token: string;
            id_token?: string;
            refresh_token?: string;
            token_type: "bearer" | "";
            expires_in?: number;
            scopes?: string;
            state?: string;
        } = {
            access_token: access_token.toJwt(secret),
            id_token: id_token.toJwt(secret),
            token_type: "bearer",
            expires_in: Math.round(
                moment
                    .duration(
                        moment(moment().add(1, "h")).diff(moment(new Date()))
                    )
                    .asSeconds()
            )
        };

        return this.Ok(callback, response, {
            "Cache-Control": "no-store",
            Pragma: "no-cache"
        });
    }
}
