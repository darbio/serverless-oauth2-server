import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context
} from "aws-lambda";

import { AuthorizeHandler } from "./infrastructure/handlers/AuthorizeHandler";
import { CallbackHandler } from "./infrastructure/handlers/CallbackHandler";
import { LoginHandler } from "./infrastructure/handlers/LoginHandler";
import { ProvidersHandler } from "./infrastructure/handlers/ProvidersHandler";
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
    let handler = new ProvidersHandler();
    await handler.get(event, context, callback);
}

// login?session=1234
export async function login(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback<APIGatewayProxyResult>
) {
    let handler = new LoginHandler();
    if (event.httpMethod.toLowerCase() === "get") {
        await handler.get(event, context, callback);
    } else if (event.httpMethod.toLowerCase() === "post") {
        await handler.post(event, context, callback);
    }
}
