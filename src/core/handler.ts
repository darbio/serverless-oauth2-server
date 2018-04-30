import { Callback, APIGatewayProxyResult } from "aws-lambda";

export abstract class Handler {
    Ok(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ): void {
        callback(null, {
            statusCode: 200,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        });
    }

    Redirect(
        callback: Callback<APIGatewayProxyResult>,
        location: string,
        headers?: { [header: string]: string | number | boolean }
    ): void {
        if (!headers) {
            headers = {};
        }
        headers["Location"] = location;
        callback(null, {
            statusCode: 302,
            headers: headers ? headers : null,
            body: null
        });
    }

    Error(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        callback(null, {
            statusCode: 302,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        });
    }

    Unauthorized(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        callback(null, {
            statusCode: 401,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        });
    }

    BadRequest(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        callback(null, {
            statusCode: 400,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        });
    }
}
