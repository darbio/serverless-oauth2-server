import { IProviderSessionRepository } from "../../core/repositories/IProviderSessionRepository";
import { DynamoDbRepository } from "./DynamoDbRepository";
import { ProviderSession } from "../models/ProviderSession";

interface IProviderSessionDataObject {
    id: string;
    provider: string;
    sessionId: string;
    expires: number;
    created: number;
}

export class ProviderSessionRepository
    extends DynamoDbRepository<ProviderSession>
    implements IProviderSessionRepository {
    constructor() {
        super("authorization_providerSessions");
    }

    toDataObject(domainObject: ProviderSession): IProviderSessionDataObject {
        return <IProviderSessionDataObject>{
            id: domainObject.id,
            provider: domainObject.provider,
            sessionId: domainObject.sessionId,
            expires: domainObject.expires.getTime()
        };
    }

    toDomainObject(dataObject: IProviderSessionDataObject): ProviderSession {
        let domainObject = new ProviderSession();

        domainObject["_id"] = dataObject.id;
        domainObject["_provider"] = dataObject.provider;
        domainObject["_sessionId"] = dataObject.sessionId;
        domainObject["_created"] = new Date(dataObject.created);
        domainObject["_expires"] = new Date(dataObject.expires);

        return domainObject;
    }
}
