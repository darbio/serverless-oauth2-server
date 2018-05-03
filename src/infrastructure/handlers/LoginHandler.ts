import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as jsonwebtoken from "jsonwebtoken";
import * as querystring from "querystring";
import * as mustache from "mustache";
import { Handler } from "../../core/handler";
import * as request from "request-promise-native";
import * as path from "path";
import * as fs from "fs";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { ProviderRepository } from "../repositories/ProviderRepository";
import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { AuthorizationCode } from "../models/AuthorizationCode";
import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { AuthorizationCodeRepository } from "../repositories/AuthorizationCodeRepository";
import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { ProviderSessionRepository } from "../repositories/ProviderSessionRepository";
import { IUserRepository } from "../../core/repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { IUser } from "../../core/models/IUser";
import { User, ExternalIdentity } from "../models/User";

export class LoginHandler extends Handler {
    async get(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        // Query parameters
        const sessionId = event.queryStringParameters.session;

        // Load the template
        let template = fs.readFileSync(
            path.resolve(
                process.env.LAMBDA_TASK_ROOT || "",
                "src/templates/login/template.html"
            ),
            "utf8"
        );
        let html = mustache.render(template, { sessionId: sessionId });

        // Callback
        callback(null, {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html"
            },
            body: html
        });
    }

    async post(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        try {
            // Get the request variables
            const formParts = querystring.parse(event.body);
            const username = `${formParts.username}`;
            const password = `${formParts.password}`;
            const sessionId = event.queryStringParameters.session;

            console.log(formParts);

            const sessionRepository = new SessionRepository();
            const session = await sessionRepository.get(sessionId);

            // Validate the session
            if (!session.isValid()) {
                return callback(new Error("Session has expired"), {
                    statusCode: 401,
                    body: null
                });
            }

            const userRepository: IUserRepository = new UserRepository();
            const user = await userRepository.get(username);

            if (!user) {
                throw new Error("Username invalid");
            }

            if (!user.hasInternalIdentity()) {
                throw new Error("Username is not registered locally");
            }

            let internalIdentity = user.getInternalIdentity();
            if (internalIdentity.login(password)) {
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
                    return callback(null, {
                        statusCode: 302,
                        headers: {
                            Location: url
                        },
                        body: null
                    });
                }
            } else {
                // Login failed
                return callback(null, {
                    statusCode: 401,
                    body: JSON.stringify({
                        message: "Invalid credentials"
                    })
                });
            }
        } catch (err) {
            return this.Error(callback, {
                error: "server_error",
                error_description: err.message || err
            });
        }
    }
}
