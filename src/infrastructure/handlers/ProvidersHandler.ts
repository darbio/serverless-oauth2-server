import {
    APIGatewayProxyEvent,
    Context,
    Callback,
    APIGatewayProxyResult
} from "aws-lambda";
import * as uuid from "uuid/v4";
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
            let codeUrl = `${
                provider.authorizationUrl
            }?response_type=code&client_id=${provider.clientId}&redirect_uri=${
                provider.callbackUrl
            }&scope=${provider.scope.join("+")}&state=${providerSession.id}`;

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
