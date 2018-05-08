import { IAuthorizationCodeRepository } from '../../core/repositories/IAuthorizationCodeRepository';
import { AuthorizationCode } from '../models/AuthorizationCode';
import { DynamoDbRepository } from './DynamoDbRepository';

interface IAuthorizationCodeDataObject {
    id: string;
    clientId: string;
    redirectUri: string;
    subject: string;
    created: number;
    expires: number;
}

export class AuthorizationCodeRepository
    extends DynamoDbRepository<AuthorizationCode>
    implements IAuthorizationCodeRepository {
    constructor() {
        super(process.env.CODES_TABLE_NAME);
    }

    toDomainObject(
        dataObject: IAuthorizationCodeDataObject
    ): AuthorizationCode {
        let domainObject = new AuthorizationCode();
        domainObject["_id"] = dataObject.id;
        domainObject["_clientId"] = dataObject.clientId;
        domainObject["_redirectUri"] = dataObject.redirectUri;
        domainObject["_subject"] = dataObject.subject;
        domainObject["_created"] = new Date(dataObject.created * 1000);
        domainObject["_expires"] = new Date(dataObject.expires * 1000);

        return domainObject;
    }

    toDataObject(
        businessObject: AuthorizationCode
    ): IAuthorizationCodeDataObject {
        return {
            id: businessObject.id,
            clientId: businessObject.clientId,
            redirectUri: businessObject.redirectUri,
            subject: businessObject.subject,
            created: businessObject.created.getTime() / 1000,
            expires: businessObject.expires.getTime() / 1000
        };
    }
}
