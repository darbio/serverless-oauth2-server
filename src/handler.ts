import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from 'aws-lambda';
import * as qs from 'querystring';

import {
    IUserLoginService
} from './core/IUserLoginService';
import {
    UserLoginService
} from './infrastructure/UserLoginService';
import {
    DynamoDbRepository
} from './infrastructure/repositories/DynamoDbRepository';
import { SessionService } from './infrastructure/services/SessionService';
import { SessionRepository } from './infrastructure/repositories/SessionRepository';
import { AuthorizationCodeRepository } from './infrastructure/repositories/AuthorizationCodeRepository';
import { Session } from './infrastructure/models/Session';
import { AuthorizationCode } from './infrastructure/models/AuthorizationCode';

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
        let session = Session.Create({
            responseType: event.queryStringParameters.response_type as 'code' | 'token',
            redirectUri: event.queryStringParameters.redirect_uri,
            state: event.queryStringParameters.state
        })
        console.log(`Created session with id: ${session.id}`)

        // Validate client_id
        const client_id = event.queryStringParameters.client_id
        if (client_id !== '167c05ab-4a58-47dc-b695-388f8bca6e43') {
            throw new Error('Invalid client id')
        }

        // Validate client_secret
        if (session.responseType == 'token') {
            const client_secret = event.queryStringParameters.client_secret

            if (client_secret !== 'SECRET') {
                throw new Error('Invalid client secret')
            }
        }

        const sessionRepository = new SessionRepository();
        await sessionRepository.save(session);
        console.log(`Saved session with id: ${session.id}`)

        console.log(`Redirecting to: ${session.getLoginUrl()}`)
        callback(null, {
            statusCode: 302,
            headers: {
                'Location': session.getLoginUrl()
            },
            body: null
        });
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
            // Get the request variables
            const formParts = qs.parse(event.body);
            const username = formParts.username
            const password = formParts.password
            const sessionId = event.queryStringParameters.session

            const sessionRepository = new SessionRepository();
            const session = await sessionRepository.get(sessionId);

            if (!session.isValid()) {
                callback(new Error('Session has expired'), {
                    statusCode: 401,
                    body: null
                })
                return;
            }

            const userLoginService: IUserLoginService = new UserLoginService()

            if (await userLoginService.login(username, password)) {
                // Login successful
                if (session.responseType === 'token') {
                    throw new Error('Not implemented')
                }
                if (session.responseType === 'code') {
                    // Generate an authroization code
                    const code = AuthorizationCode.create({ subject: username });
                    
                    // Save the auth code
                    const authorizationCodeRepository = new AuthorizationCodeRepository();
                    authorizationCodeRepository.save(code);

                    // Send them back to the auth server with a authorization code
                    const url = `${session.redirectUri}?code=${code.id}&state=${session.state}`
                    callback(null, {
                        statusCode: 302,
                        headers: {
                            'Location': url
                        },
                        body: null
                    })
                }
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