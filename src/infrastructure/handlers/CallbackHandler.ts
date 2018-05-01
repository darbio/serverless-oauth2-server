import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as querystring from "querystring";
import { Handler } from "../../core/handler";
import * as request from "request-promise-native";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { ProviderRepository } from "../repositories/ProviderRepository";
import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { AuthorizationCode } from "../models/AuthorizationCode";
import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { AuthorizationCodeRepository } from "../repositories/AuthorizationCodeRepository";
import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { ProviderSessionRepository } from "../repositories/ProviderSessionRepository";

export class CallbackHandler extends Handler {
    async get(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        try {
            // Parameters
            const authCode = event.queryStringParameters.code;
            const state = event.queryStringParameters.state;

            // Verify state has not changed
            let providerSessionRepository: IProviderSessionRepository = new ProviderSessionRepository();
            let providerSession = await providerSessionRepository.get(state);
            if (!providerSession || !providerSession.isValid()) {
                return this.BadRequest(callback, {
                    error: "invalid_state",
                    error_description: `Invalid state ${state}`
                });
            }

            // Get the provider
            let providerRepository: IProviderRepository = new ProviderRepository();
            let provider = await providerRepository.get(
                providerSession.provider
            );

            // Exchange authorization code for token
            // POST provider.tokenUrl
            let requestOptions: request.RequestPromiseOptions = {
                form: {
                    grant_type: "authorization_code",
                    code: authCode,
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    redirect_uri: provider.callbackUrl
                }
            };
            let tokenRequest = await request.post(
                provider.tokenUrl,
                requestOptions
            );

            // Parse the request
            let body: {
                accessToken: string;
                //refreshToken: string;
                token_type: "bearer";
                expires: number;
            } = tokenRequest;

            console.log("Body:");
            console.log(JSON.stringify(body));

            // Save the refresh token
            // TODO

            // Get the profile so we can create a user in our system
            // TODO
            let username = "username_TEMP";

            // Get the original session
            let sessionRepository: ISessionRepository = new SessionRepository();
            let session = await sessionRepository.get(
                providerSession.sessionId
            );

            // Generate an authorization code
            const code = AuthorizationCode.create({
                subject: username,
                clientId: session.clientId,
                redirectUrl: session.redirectUri
            });

            // Save the auth code
            const authorizationCodeRepository: IAuthorizationCodeRepository = new AuthorizationCodeRepository();
            authorizationCodeRepository.save(code);

            // Send them back to the auth server with a authorization code
            const url = `${code.redirectUri}?code=${code.id}&state=${
                session.id
            }`;
            return this.Redirect(callback, url);
        } catch (err) {
            return this.Error(callback, {
                error: "server_error",
                error_description: err.message || err
            });
        }
    }
}
