import {
    APIGatewayProxyEvent,
    Context,
    Callback
} from 'aws-lambda';

export async function token(event: APIGatewayProxyEvent, context: Context, callback: Callback) {
    callback(null, "hello")
};

export async function authorize(event: APIGatewayProxyEvent, context: Context, callback: Callback) {
    callback(null, "hello")
};