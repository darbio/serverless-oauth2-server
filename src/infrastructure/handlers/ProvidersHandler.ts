import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as uuid from "uuid/v4";
import * as querystring from "querystring";
import { Handler } from "../../core/handler";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { ProviderRepository } from "../repositories/ProviderRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { Session } from "../models/Session";
import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { ProviderSessionRepository } from "../repositories/ProviderSessionRepository";
import { ProviderSession } from "../models/ProviderSession";

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
                redirect_uri: provider.callbackUrl,
                response_type: "code",
                client_id: provider.clientId
            };

            let codeUrl = `${provider.authorizationUrl}?${querystring.stringify(
                params
            )}`;

            // Redirect user to provider
            return this.Redirect(callback, codeUrl);
        } catch (err) {
            console.error(err);
            this.Error(callback, {
                error: "server_error",
                error_description: err
            });
        }
    }
}
