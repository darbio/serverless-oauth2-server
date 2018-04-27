import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from 'aws-lambda';

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

let tokenService: ITokenService = new TokenService()
let authorizationService: IAuthorizationService

export async function token(event: APIGatewayProxyEvent, context: Context, callback: Callback) {
    // Response type
    // password (resource owner password grant) - token?grant_type=password&username=USERNAME&password=PASSWORD&client_id=CLIENT_ID
    // client_credentials (client id and secret) - token?grant_type=client_credentials&client_id=CLIENT_ID&client_secret=CLIENT_SECRET
    // refresh - token?grant_type=refresh_token&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&refresh_token=REFRESH_TOKEN

    callback(null, "hello")
};

// code - authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read
// token (implicit) - authorize?response_type=token&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&scope=read+write
export async function authorize(event: APIGatewayProxyEvent, context: Context, callback: Callback<APIGatewayProxyResult>) {
    try {
        let params: IAuthorizationServiceParams = {
            responseType: event.queryStringParameters.response_type as 'code' | 'token',
            clientId: event.queryStringParameters.client_id,
            clientSecret: event.queryStringParameters.client_secret,
            redirectUri: event.queryStringParameters.redirect_uri,
            scopes: event.queryStringParameters.scope.split('+'),
            state: event.queryStringParameters.state
        }
        authorizationService = new AuthorizationService(params)

        callback(null, {
            statusCode: 302,
            headers: {
                'Location': authorizationService.loginUrl
            },
            body: JSON.stringify(params)
        })
    }
    catch (err) {
        callback(err, {
            statusCode: 500,
            body: JSON.stringify(err)
        })
    }
};