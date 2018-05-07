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
import * as url from "url";

export class LoginHandler extends Handler {
    async get(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        // Query parameters
        const sessionId = event.queryStringParameters.session;

        // Load the template
        // let template = fs.readFileSync(
        //     path.resolve(
        //         process.env.LAMBDA_TASK_ROOT || "",
        //         "src/templates/login/template.html"
        //     ),
        //     "utf8"
        // );
        let html = mustache.render(
            `<html lang="en">

        <head>
            <!-- Required meta tags -->
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        
            <!-- Bootstrap CSS -->
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
                crossorigin="anonymous">
        
            <!-- Font awesome -->
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.11/css/all.css" integrity="sha384-p2jx59pefphTFIpeqCcISO9MdVfIm4pNnsL08A6v5vaQc4owkQqxMV8kg4Yvhaw/"
                crossorigin="anonymous">
        
            <style>
                html,
                body {
                    height: 100%;
                }
        
                body {
                    display: -ms-flexbox;
                    display: flex;
                    -ms-flex-align: center;
                    align-items: center;
                    padding-top: 40px;
                    padding-bottom: 40px;
                    background-color: #f5f5f5;
                }
        
                .form-signin {
                    width: 100%;
                    max-width: 330px;
                    padding: 15px;
                    margin: auto;
                }
        
                .form-signin .checkbox {
                    font-weight: 400;
                }
        
                .form-signin .form-control {
                    position: relative;
                    box-sizing: border-box;
                    height: auto;
                    padding: 10px;
                    font-size: 16px;
                }
        
                .form-signin .form-control:focus {
                    z-index: 2;
                }
        
                .form-signin input[type="email"] {
                    margin-bottom: -1px;
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                }
        
                .form-signin input[type="password"] {
                    margin-bottom: 10px;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
            </style>
        </head>
        
        <body class="text-center">
            <form class="form-signin" action="/login?session={{sessionId}}" method="post">
                <img class="mb-4" src="https://avatars1.githubusercontent.com/u/517620?s=460&v=4" alt="" width="72" height="72">
                <h1 class="h3 mb-3 font-weight-normal">Please sign in</h1>
                <!-- <a href="/providers/google?session{{sessionId}}" class="btn btn-lg btn-primary btn-block">
                        <i class="fab fa-google pull-left"></i> Login with Google</a>
                    <p class="mt-2 mb-2 text-muted">
                        <em>or</em>
                    </p> -->
                <label for="username" class="sr-only">Email address</label>
                <input type="email" id="username" name="username" class="form-control" placeholder="Email address" required autofocus>
                <label for="password" class="sr-only">Password</label>
                <input type="password" id="password" name="password" class="form-control" placeholder="Password" required>
                <div class="checkbox mb-3">
                    <label>
                        <input type="checkbox" value="remember-me"> Remember me
                    </label>
                </div>
                <button class="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
                <a href="#">Don't remember your password?</a>
                <a href="/providers/google?session={{sessionId}}" class="mt-5 btn btn-outline-dark btn-block">
                    <i class="fab fa-google float-left mt-1"></i> Sign in using Google
                </a>
                <p class="mt-5 mb-3 text-muted">&copy; 2017-2018</p>
            </form>
        
        
            <!-- Optional JavaScript -->
            <!-- jQuery first, then Popper.js, then Bootstrap JS -->
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
                crossorigin="anonymous"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ"
                crossorigin="anonymous"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
                crossorigin="anonymous"></script>
        
        </body>
        
        </html>`,
            { sessionId: sessionId }
        );

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
                    return this.Redirect(
                        callback,
                        url.resolve(
                            process.env.BASE_URL,
                            `${session.redirectUri}?code=${code.id}&state=${
                                session.state
                            }`
                        )
                    );
                }
            } else {
                // Login failed
                return this.Unauthorized(callback, {
                    message: "Invalid credentials"
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
