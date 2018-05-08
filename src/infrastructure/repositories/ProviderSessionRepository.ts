import { IProviderSessionRepository } from '../../core/repositories/IProviderSessionRepository';
import { ProviderSession } from '../models/ProviderSession';
import { DynamoDbRepository } from './DynamoDbRepository';

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
        super(process.env.PROVIDER_SESSIONS_TABLE_NAME);
    }

    toDataObject(domainObject: ProviderSession): IProviderSessionDataObject {
        return {
            id: domainObject.id,
            provider: domainObject.provider,
            sessionId: domainObject.sessionId,
            expires: domainObject.expires.getTime() / 1000,
            created: domainObject.created.getTime() / 1000
        };
    }

    toDomainObject(dataObject: IProviderSessionDataObject): ProviderSession {
        let domainObject = new ProviderSession();

        domainObject["_id"] = dataObject.id;
        domainObject["_provider"] = dataObject.provider;
        domainObject["_sessionId"] = dataObject.sessionId;
        domainObject["_created"] = new Date(dataObject.created * 1000);
        domainObject["_expires"] = new Date(dataObject.expires * 1000);

        return domainObject;
    }
}
