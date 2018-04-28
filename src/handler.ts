import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from 'aws-lambda';
import * as qs from 'querystring';
import * as jsonwebtoken from 'jsonwebtoken';
import * as validator from 'validator';
import * as moment from 'moment';

import {
    IUserLoginService
} from './core/IUserLoginService';
import {
    UserLoginService
} from './infrastructure/UserLoginService';
import {
    DynamoDbRepository
} from './infrastructure/repositories/DynamoDbRepository';
import { SessionRepository } from './infrastructure/repositories/SessionRepository';
import { AuthorizationCodeRepository } from './infrastructure/repositories/AuthorizationCodeRepository';
import { Session } from './infrastructure/models/Session';
import { AuthorizationCode } from './infrastructure/models/AuthorizationCode';
import { IAuthorizationCodeRepository } from './core/repositories/IAuthorizationCodeRepository';
import { NumberOfLaunchConfigurations } from 'aws-sdk/clients/autoscaling';

// authorization_code - token?grant_type=authorization_code&code=AUTH_CODE_HERE&redirect_uri=REDIRECT_URI&client_id=CLIENT_ID
// *not implemented* password (resource owner password grant) - token?grant_type=password&username=USERNAME&password=PASSWORD&client_id=CLIENT_ID
// *not implemented* client_credentials (client id and secret) - token?grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
// *not implemented* refresh - token?grant_type=refresh_token&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=REFRESH_TOKEN
export async function token(event: APIGatewayProxyEvent, context: Context, callback: Callback < APIGatewayProxyResult > ) {
    try {
        // Validate client_id
        // TODO - move to a service
        const client_id = event.queryStringParameters.client_id
        if (client_id !== '167c05ab-4a58-47dc-b695-388f8bca6e43') {
            throw new Error('Invalid client id')
        }

        // Validate client_secret
        // TODO - move to a service
        if (event.queryStringParameters.client_secret) {
            const client_secret = event.queryStringParameters.client_secret

            if (client_secret !== 'SECRET') {
                throw new Error('Invalid client secret')
            }
        }

        // Validate grant_type
        const grant_type = event.queryStringParameters.grant_type
        switch (grant_type) {
            case 'authorization_code':
                
                // Validate code    
                const code = event.queryStringParameters.code
                if (!validator.isUUID(code)) {
                    throw new Error('Invalid authorization code')
                }

                // Validate redirect_uri
                const redirect_uri = event.queryStringParameters.redirect_uri
                if (!validator.isURL(redirect_uri)) {
                    throw new Error('Invalid redirect url')
                }

                // Get the auth_code
                const authorizationCodeRepository: IAuthorizationCodeRepository = new AuthorizationCodeRepository()
                const authorizationCode = await authorizationCodeRepository.get(code)

                if (authorizationCode === null) {
                    throw new Error('Non-existant authorization code')
                }

                // Validate
                if (redirect_uri !== authorizationCode.redirectUri) {
                    throw new Error('Invalid redirect url')
                }
                if (client_id !== authorizationCode.clientId) {
                    throw new Error(`Invalid client id`)
                }

                // Generate the access_token
                const secret = 'SECRET'
                let access_token = jsonwebtoken.sign({ sub: authorizationCode.subject, aud: authorizationCode.clientId, iss: 'https://idp.darb.io', exp: moment(moment().add(1, 'h')).unix() }, secret);
                let id_token = jsonwebtoken.sign({ sub: authorizationCode.subject, aud: authorizationCode.clientId, iss: 'https://idp.darb.io', exp: moment(moment().add(1, 'h')).unix() }, secret)

                // Save the tokens to the database
                // TODO

                // Revoke the authorization code
                await authorizationCodeRepository.delete(authorizationCode.id)

                // Response
                let response: {
                    access_token: string
                    id_token?: string
                    refresh_token?: string
                    token_type: 'bearer' | ''
                    expires_in?: number
                    scopes?: string
                    state?: string

                } = {
                    access_token: access_token,
                    id_token: id_token,
                    token_type: 'bearer',
                    expires_in: Math.round(moment.duration(moment(moment().add(1, 'h')).diff(moment(new Date()))).asSeconds()),
                };

                callback(null, {
                    statusCode: 200,
                    headers: {
                        'Cache-Control': 'no-store',
                        'Pragma': 'no-cache'
                    },
                    body: JSON.stringify(response)
                })

                
                break
            case 'password':
                throw new Error('Not implemented')
                //break
            default:
                throw new Error('Invalid grant type')    
        }
        
    }
    catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err)
        })
    }
};

// code - authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
// *not implemented* token (implicit) - authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read+write
export async function authorize(event: APIGatewayProxyEvent, context: Context, callback: Callback < APIGatewayProxyResult > ) {
    try {
        // Validate client_id
        // TODO - move to a service
        const client_id = event.queryStringParameters.client_id
        if (client_id !== '167c05ab-4a58-47dc-b695-388f8bca6e43') {
            throw new Error('Invalid client id')
        }

        let session = Session.Create({
            clientId: client_id,
            responseType: event.queryStringParameters.response_type as 'code' | 'token',
            redirectUri: event.queryStringParameters.redirect_uri,
            state: event.queryStringParameters.state
        })

        const sessionRepository = new SessionRepository()
        await sessionRepository.save(session)

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
            const username = `${formParts.username}`
            const password = `${formParts.password}`
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
                    const code = AuthorizationCode.create({
                        subject: username,
                        clientId: session.clientId,
                        redirectUrl: session.redirectUri
                    });
                    
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