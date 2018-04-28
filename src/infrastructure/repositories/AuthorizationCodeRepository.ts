import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { DynamoDbRepository } from "./DynamoDbRepository";
import { AuthorizationCode } from "../models/AuthorizationCode";
import * as moment from "moment";

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
        super("authorization_codes");
    }

    toDomainObject(
        dataObject: IAuthorizationCodeDataObject
    ): AuthorizationCode {
        let domainObject = new AuthorizationCode();
        domainObject["_id"] = dataObject.id;
        domainObject["_clientId"] = dataObject.clientId;
        domainObject["_redirectUri"] = dataObject.redirectUri;
        domainObject["_subject"] = dataObject.subject;
        domainObject["_created"] = new Date(dataObject.created);
        domainObject["_expires"] = new Date(dataObject.expires);

        return domainObject;
    }

    toDataObject(
        businessObject: AuthorizationCode
    ): IAuthorizationCodeDataObject {
        return <IAuthorizationCodeDataObject>{
            id: businessObject.id,
            clientId: businessObject.clientId,
            redirectUri: businessObject.redirectUri,
            subject: businessObject.subject,
            created: businessObject.created.getTime(),
            expires: businessObject.expires.getTime()
        };
    }
}
