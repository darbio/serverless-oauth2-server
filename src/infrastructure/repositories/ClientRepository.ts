import { IClientRepository } from '../../core/repositories/IClientRepository';
import { Client } from '../models/Client';
import { DynamoDbRepository } from './DynamoDbRepository';

interface IClientDataObject {
    id: string;
    secret?: string;
    jwtSecret: string;
    redirectUris?: string[];
    grantType: string;
}

export class ClientRepository extends DynamoDbRepository<Client>
    implements IClientRepository {
    constructor() {
        super(process.env.CLIENTS_TABLE_NAME);
    }

    toDataObject(domainObject: Client): IClientDataObject {
        return {
            id: domainObject.id,
            secret: domainObject.secret,
            jwtSecret: domainObject.jwtSecret,
            grantType: domainObject.grantType,
            redirectUris: domainObject.redirectUris
        };
    }

    toDomainObject(businessObject: IClientDataObject): Client {
        let client = new Client();

        client["_id"] = businessObject.id;
        client["_secret"] = businessObject.secret;
        client["_jwtSecret"] = businessObject.jwtSecret;
        client["_grantType"] = businessObject.grantType;
        client["_redirectUris"] = businessObject.redirectUris;

        return client;
    }
}
