import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context
} from "aws-lambda";
import * as jsonwebtoken from "jsonwebtoken";
import * as request from "request-promise-native";
import * as url from "url-join";

import { Handler } from "../../core/handler";
import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { IUserRepository } from "../../core/repositories/IUserRepository";
import { AuthorizationCode } from "../models/AuthorizationCode";
import { ExternalIdentity, User } from "../models/User";
import { AuthorizationCodeRepository } from "../repositories/AuthorizationCodeRepository";
import { ProviderRepository } from "../repositories/ProviderRepository";
import { ProviderSessionRepository } from "../repositories/ProviderSessionRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { UserRepository } from "../repositories/UserRepository";

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

            // Exchange authorization code for token POST provider.tokenUrl
            let requestOptions: request.RequestPromiseOptions = {
                form: {
                    grant_type: "authorization_code",
                    code: authCode,
                    client_id: provider.clientId,
                    client_secret: provider.clientSecret,
                    redirect_uri: url(
                        process.env.BASE_URL,
                        "callback/",
                        provider.id
                    )
                }
            };
            let tokenRequest = await request.post(
                provider.tokenUrl,
                requestOptions
            );

            if (tokenRequest.error) {
                throw new Error(tokenRequest.error);
            }

            // Parse the request
            let body: {
                access_token: string;
                id_token: string;
                refresh_token: string;
                token_type: "bearer";
                expires: number;
            } = JSON.parse(tokenRequest);

            // Verify the signature of the JWT
            // TODO

            // Get the profile so we can create a user in our system
            let jwt = jsonwebtoken.decode(body.id_token);
            let username = jwt["email"];
            let sub = jwt["sub"];

            if (!username) {
                throw new Error("Email must be returned");
            }

            let userRepository: IUserRepository = new UserRepository();
            let user = await userRepository.get(username);

            if (!user) {
                // Create the user
                user = User.createExternalUser({
                    username: username,
                    provider: {
                        id: provider.id,
                        sub: sub
                    },
                    profile: {
                        name: jwt["name"],
                        givenName: jwt["given_name"],
                        familyName: jwt["family_name"],
                        emailAddress: jwt["email"],
                        emailVerified: jwt["email_verified"],
                        pictureUrl: jwt["picture"]
                    }
                });
                await userRepository.save(user);
            }

            // Add this identity provider to the user if it doesn't already exist
            if (
                !user.hasIdentityFromExternalProvider({ provider: provider.id })
            ) {
                user.addExternalIdentity(
                    ExternalIdentity.create({ provider: provider.id, sub: sub })
                );
                await userRepository.save(user);
            }

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
            return this.Redirect(
                callback,
                `${code.redirectUri}?code=${code.id}&state=${session.state}`
            );
        } catch (err) {
            return this.Error(callback, {
                error: "server_error",
                error_description: err.message || err
            });
        }
    }
}
