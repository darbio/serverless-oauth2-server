import { DynamoDbRepository } from "./DynamoDbRepository";
import { IProviderRepository } from "../../core/repositories/IProviderRepository";
import { Provider } from "../models/Provider";

interface IProviderDataObject {
    id: string;
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    callbackUrl: string;
    profileUrl: string;
    scope: string[];
}

export class ProviderRepository extends DynamoDbRepository<Provider>
    implements IProviderRepository {
    constructor() {
        super("authorization_providers");
    }

    toDataObject(domainObject: Provider): IProviderDataObject {
        return <IProviderDataObject>{
            id: domainObject.id,
            clientId: domainObject.clientId,
            clientSecret: domainObject.clientSecret,
            authorizationUrl: domainObject.authorizationUrl,
            tokenUrl: domainObject.tokenUrl,
            callbackUrl: domainObject.callbackUrl,
            profileUrl: domainObject.profileUrl,
            scope: domainObject.scope
        };
    }

    toDomainObject(dataObject: IProviderDataObject): Provider {
        let provider = new Provider();

        provider["_id"] = dataObject.id;
        provider["_clientId"] = dataObject.clientId;
        provider["_clientSecret"] = dataObject.clientSecret;
        provider["_authorizationUrl"] = dataObject.authorizationUrl;
        provider["_tokenUrl"] = dataObject.tokenUrl;
        provider["_callbackUrl"] = dataObject.callbackUrl;
        provider["_profileUrl"] = dataObject.profileUrl;
        provider["_scope"] = dataObject.scope;

        return provider;
    }
}
