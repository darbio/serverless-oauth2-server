import { APIGatewayProxyResult, Callback } from 'aws-lambda';

export abstract class Handler {
    Ok(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ): void {
        const response = {
            statusCode: 200,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        };
        console.log(response);
        callback(null, response);
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
        const response = {
            statusCode: 302,
            headers: headers ? headers : null,
            body: null
        };
        console.log(JSON.stringify(response));
        callback(null, response);
    }

    Error(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        const response = {
            statusCode: 302,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        };
        console.log(JSON.stringify(response));
        callback(null, response);
    }

    Unauthorized(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        const response = {
            statusCode: 401,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        };
        console.log(response);
        callback(null, response);
    }

    BadRequest(
        callback: Callback<APIGatewayProxyResult>,
        body?: any,
        headers?: { [header: string]: string | number | boolean }
    ) {
        const response = {
            statusCode: 400,
            headers: headers ? headers : null,
            body: body ? JSON.stringify(body) : null
        };
        console.log(response);
        callback(null, response);
    }
}
