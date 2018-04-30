import { IClientRepository } from "../../core/repositories/IClientRepository";
import { DynamoDbRepository } from "./DynamoDbRepository";
import { Client } from "../models/Client";

interface IClientDataObject {
    id: string;
    secret?: string;
    redirectUris?: string[];
    grantType: string;
}

export class ClientRepository extends DynamoDbRepository<Client>
    implements IClientRepository {
    constructor() {
        super("authorization_clients");
    }

    toDataObject(domainObject: Client): IClientDataObject {
        return <IClientDataObject>{
            id: domainObject.id,
            secret: domainObject.secret,
            grantType: domainObject.grantType,
            redirectUris: domainObject.redirectUris
        };
    }

    toDomainObject(businessObject: IClientDataObject): Client {
        let client = new Client();

        client["_id"] = businessObject.id;
        client["_secret"] = businessObject.secret;
        client["_grantType"] = businessObject.grantType;
        client["_redirectUris"] = businessObject.redirectUris;

        return client;
    }
}
