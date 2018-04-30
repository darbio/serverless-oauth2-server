import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as qs from "querystring";
import * as jsonwebtoken from "jsonwebtoken";
import * as validator from "validator";
import * as moment from "moment";

import { DynamoDbRepository } from "./infrastructure/repositories/DynamoDbRepository";
import { SessionRepository } from "./infrastructure/repositories/SessionRepository";
import { AuthorizationCodeRepository } from "./infrastructure/repositories/AuthorizationCodeRepository";
import { Session } from "./infrastructure/models/Session";
import { AuthorizationCode } from "./infrastructure/models/AuthorizationCode";
import { IAuthorizationCodeRepository } from "./core/repositories/IAuthorizationCodeRepository";
import { NumberOfLaunchConfigurations } from "aws-sdk/clients/autoscaling";
import { Token } from "./infrastructure/models/Token";
import { ITokenRepository } from "./core/repositories/ITokenRepository";
import { TokenRepository } from "./infrastructure/repositories/TokenRepository";
import { IUserRepository } from "./core/repositories/IUserRepository";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { IClientRepository } from "./core/repositories/IClientRepository";
import { ClientRepository } from "./infrastructure/repositories/ClientRepository";
import { TokenHandler } from "./infrastructure/handlers/TokenHandler";

// authorization_code - token?grant_type=authorization_code&code=AUTH_CODE_HERE&redirect_uri=REDIRECT_URI&client_id=CLIENT_ID
// *not implemented* password (resource owner password grant) - token?grant_type=password&username=USERNAME&password=PASSWORD&client_id=CLIENT_ID
// *not implemented* client_credentials (client id and secret) - token?grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
// *not implemented* refresh - token?grant_type=refresh_token&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=REFRESH_TOKEN
export async function token(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    let handler = new TokenHandler();
    await handler.get(event, context, callback);
}

// code - authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
// *not implemented* token (implicit) - authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read+write
export async function authorize(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    try {
        // Validate client_id
        const client_id = event.queryStringParameters.client_id;

        let clientRepository: IClientRepository = new ClientRepository();
        let client = await clientRepository.get(client_id);

        if (!client) {
            callback(null, {
                statusCode: 401,
                body: JSON.stringify({
                    error: "invalid_client",
                    error_description: "Request contains an invalid client id."
                })
            });
            return;
        }

        // Validate client_secret
        const clientSecret = event.queryStringParameters.client_secret;
        if (clientSecret) {
            if (client.secret && clientSecret !== client.secret) {
                callback(null, {
                    statusCode: 401,
                    body: JSON.stringify({
                        error: "invalid_client",
                        error_description:
                            "Request contains an invalid client secret."
                    })
                });
                return;
            }
        }

        // Validate redirect_uri
        const redirectUri = event.queryStringParameters.redirect_uri;
        if (
            client.redirectUris &&
            client.redirectUris.indexOf(redirectUri) > -1
        ) {
            callback(null, {
                statusCode: 401,
                body: JSON.stringify({
                    error: "invalid_grant",
                    error_description:
                        "Request contains an invalid redirect uri."
                })
            });
            return;
        }

        // Create a new session
        let session = Session.Create({
            clientId: client_id,
            responseType: event.queryStringParameters.response_type as
                | "code"
                | "token",
            redirectUri: event.queryStringParameters.redirect_uri,
            state: event.queryStringParameters.state
        });

        const sessionRepository = new SessionRepository();
        await sessionRepository.save(session);

        callback(null, {
            statusCode: 302,
            headers: {
                Location: session.getLoginUrl()
            },
            body: null
        });
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify({
                error: "server_error",
                error_description: err.message
            })
        });
    }
}

// login?session=1234
export async function login(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    try {
        if (event.httpMethod.toLowerCase() === "get") {
            const sessionId = event.queryStringParameters.session;
            callback(null, {
                statusCode: 200,
                headers: {
                    "Content-Type": "text/html"
                },
                body: `
                        <html>
                            <form action="/login?session=${sessionId}" method="post">
                                <div class="container">
                                    <label for="username"><b>Username</b></label>
                                    <input type="text" placeholder="Enter Username" name="username" required>

                                    <label for="password"><b>Password</b></label>
                                    <input type="password" placeholder="Enter Password" name="password" required>

                                    <button type="submit">Login</button>
                                </div>
                            </form>
                        </html>
                    `
            });
        } else {
            // Get the request variables
            const formParts = qs.parse(event.body);
            const username = `${formParts.username}`;
            const password = `${formParts.password}`;
            const sessionId = event.queryStringParameters.session;

            const sessionRepository = new SessionRepository();
            const session = await sessionRepository.get(sessionId);

            if (!session.isValid()) {
                callback(new Error("Session has expired"), {
                    statusCode: 401,
                    body: null
                });
                return;
            }

            const userRepository: IUserRepository = new UserRepository();
            const user = await userRepository.get(username);

            if (!user) {
                throw new Error("Username invalid");
            }

            if (user.login(password)) {
                // Login successful
                if (session.responseType === "token") {
                    throw new Error("Not implemented");
                }
                if (session.responseType === "code") {
                    // Generate an authroization code
                    const code = AuthorizationCode.create({
                        subject: username,
                        clientId: session.clientId,
                        redirectUrl: session.redirectUri
                    });

                    // Save the auth code
                    const authorizationCodeRepository = new AuthorizationCodeRepository();
                    authorizationCodeRepository.save(code);

                    // Send them back to the auth server with a authorization code
                    const url = `${session.redirectUri}?code=${code.id}&state=${
                        session.state
                    }`;
                    callback(null, {
                        statusCode: 302,
                        headers: {
                            Location: url
                        },
                        body: null
                    });
                }
            } else {
                // Login failed
                callback(null, {
                    statusCode: 401,
                    body: JSON.stringify({
                        message: "Invalid credentials"
                    })
                });
            }
        }
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err)
        });
    }
}
