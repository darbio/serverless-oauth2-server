import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from 'aws-lambda';
import * as qs from 'querystring';

import {
    ITokenService
} from './core/ITokenService';
import {
    TokenService
} from './infrastructure/TokenService';

import {
    IAuthorizationService
} from './core/IAuthorizationService';
import {
    AuthorizationService,
    IAuthorizationServiceParams
} from './infrastructure/AuthorizationService';
import {
    AuthorizationSessionRepository
} from './infrastructure/SessionRepository';
import {
    IUserLoginService
} from './core/IUserLoginService';
import { UserLoginService } from './infrastructure/UserLoginService';
import { IAuthorizationSessionRepository } from './core/ISessionRepository';
import { DynamoDyRepository } from './infrastructure/DynamoDbRepository';

let tokenService: ITokenService = new TokenService()

export async function token(event: APIGatewayProxyEvent, context: Context, callback: Callback) {
    // Response type
    // password (resource owner password grant) - token?grant_type=password&username=USERNAME&password=PASSWORD&client_id=CLIENT_ID
    // client_credentials (client id and secret) - token?grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
    // refresh - token?grant_type=refresh_token&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=REFRESH_TOKEN

    callback(null, "hello")
};

// code - authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
// token (implicit) - authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read+write
export async function authorize(event: APIGatewayProxyEvent, context: Context, callback: Callback < APIGatewayProxyResult > ) {
    try {
        let params: IAuthorizationServiceParams = {
            responseType: event.queryStringParameters.response_type as 'code' | 'token',
            clientId: event.queryStringParameters.client_id,
            clientSecret: event.queryStringParameters.client_secret,
            redirectUri: event.queryStringParameters.redirect_uri,
            scopes: event.queryStringParameters.scope.split('+'),
            state: event.queryStringParameters.state
        }

        

        const authorizationService: IAuthorizationService = new AuthorizationService(new AuthorizationSessionRepository('sessions'))
        await authorizationService.init(params)

        callback(null, {
            statusCode: 302,
            headers: {
                'Location': authorizationService.loginUrl
            },
            body: null
        })
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err)
        })
    }
};

// login?session=1234
export async function login(event: APIGatewayProxyEvent, context: Context, callback: Callback < APIGatewayProxyResult > ) {
    try {
        if (event.httpMethod.toLowerCase() === 'get') {
            const sessionId = event.queryStringParameters.session
            callback(null, {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/html'
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
            })
        } else {
            // Get the credentials from the body form
            // e.g. username=username&password=password
            const formParts = qs.parse(event.body);
            const username = formParts.username
            const password = formParts.password

            // Retrieve the login session
            const sessionId = event.queryStringParameters.session
            const sessionRepository: IAuthorizationSessionRepository = new AuthorizationSessionRepository('sessions')
            const session = await sessionRepository.get(sessionId);

            const authorizationService = new AuthorizationService(new AuthorizationSessionRepository('sessions'))
            authorizationService.loadFromSession(sessionId)

            const userLoginService: IUserLoginService = new UserLoginService()

            if (await userLoginService.login(username, password)) {
                // Login successful
                // Send them back to the auth server with a authorization code which can be exchanged for a token
                const code = await authorizationService.generateAuthorizationCode();
                const url = `${session.redirectUri}?code=${code}&state=${session.state}`
                callback(null, {
                    statusCode: 302,
                    headers: {
                        'Location': url
                    },
                    body: null
                })
            } else {
                // Login failed
                callback(null, {
                    statusCode: 401,
                    body: JSON.stringify({
                        message: 'Invalid credentials'
                    })
                })
            }
        }
    } catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err)
        })
    }
}