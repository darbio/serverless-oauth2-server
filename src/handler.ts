import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as qs from "querystring";

import { SessionRepository } from "./infrastructure/repositories/SessionRepository";
import { AuthorizationCodeRepository } from "./infrastructure/repositories/AuthorizationCodeRepository";
import { AuthorizationCode } from "./infrastructure/models/AuthorizationCode";
import { IAuthorizationCodeRepository } from "./core/repositories/IAuthorizationCodeRepository";
import { Token } from "./infrastructure/models/Token";
import { ITokenRepository } from "./core/repositories/ITokenRepository";
import { TokenRepository } from "./infrastructure/repositories/TokenRepository";
import { IUserRepository } from "./core/repositories/IUserRepository";
import { UserRepository } from "./infrastructure/repositories/UserRepository";
import { IClientRepository } from "./core/repositories/IClientRepository";
import { ClientRepository } from "./infrastructure/repositories/ClientRepository";
import { TokenHandler } from "./infrastructure/handlers/TokenHandler";
import { AuthorizeHandler } from "./infrastructure/handlers/AuthorizeHandler";
import { CallbackHandler } from "./infrastructure/handlers/CallbackHandler";
import { ProvidersHandler } from "./infrastructure/handlers/ProvidersHandler";
import { IInternalUser } from "./core/models/IUser";

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

/**
 * Authorize endpoint:
 * authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
 * authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read+write
 * @param event
 * @param context
 * @param callback
 */
export async function authorize(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    console.log("authorize");
    let handler = new AuthorizeHandler();
    await handler.get(event, context, callback);
}

/**
 * Callback handler
 * @param event
 * @param context
 * @param callback
 */
export async function callback(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    console.log("callback");
    let handler = new CallbackHandler();
    await handler.get(event, context, callback);
}

/**
 * Providers handler
 * @param event
 * @param context
 * @param callback
 */
export async function providers(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    console.log("providers");
    let handler = new ProvidersHandler();
    await handler.get(event, context, callback);
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
                            <a href="/providers/google?session=${sessionId}">Login with Google</a>
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
            const user = (await userRepository.get(username)) as IInternalUser;

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
