import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Callback,
    Context
} from "aws-lambda";
import * as querystring from "querystring";
import * as url from "url-join";

import { Handler } from "../../core/handler";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { ProviderSession } from "../models/ProviderSession";
import { ProviderRepository } from "../repositories/ProviderRepository";
import { ProviderSessionRepository } from "../repositories/ProviderSessionRepository";

export class ProvidersHandler extends Handler {
    /**
     * Get request to redirect to external providers
     * @param event
     * @param context
     * @param callback
     */
    async get(
        event: APIGatewayProxyEvent,
        context: Context,
        callback: Callback<APIGatewayProxyResult>
    ) {
        try {
            // Parameters
            const providerId = event.pathParameters.providerId;
            const sessionId = event.queryStringParameters.session;

            // Get the provider
            let providerRepository: IProviderRepository = new ProviderRepository();
            let provider = await providerRepository.get(providerId);

            if (!provider) {
                return this.BadRequest(callback, {
                    error: "invalid_provider",
                    error_description: "Invalid provider"
                });
            }

            // Create state
            let providerSessionRepository: IProviderSessionRepository = new ProviderSessionRepository();
            let providerSession = ProviderSession.create({
                provider: providerId,
                sessionId: sessionId
            });
            await providerSessionRepository.save(providerSession);

            // Authorization code
            let params = {
                scope: provider.scope.join(" "),
                access_type: "offline",
                state: providerSession.id,
                redirect_uri: url(
                    process.env.BASE_URL,
                    "callback/",
                    provider.id
                ),
                response_type: "code",
                client_id: provider.clientId
            };

            // Redirect user to provider
            return this.Redirect(
                callback,
                `${provider.authorizationUrl}?${querystring.stringify(params)}`
            );
        } catch (err) {
            console.error(err);
            this.Error(callback, {
                error: "server_error",
                error_description: err
            });
        }
    }
}
