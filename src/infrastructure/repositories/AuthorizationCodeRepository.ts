import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { IAuthorizationCode } from "../../core/IModel";
import { DynamoDbRepository } from "./DynamoDbRepository";
import { AuthorizationCode } from "../models/AuthorizationCode";
import * as moment from 'moment';

interface IAuthorizationCodeDataObject {
    id: string
    subject: string
    created: number
    expires: number
}

export class AuthorizationCodeRepository extends DynamoDbRepository<AuthorizationCode>
    implements IAuthorizationCodeRepository {
    constructor() {
        super('authorization_codes')
    }

    toDomainObject(dataObject: IAuthorizationCodeDataObject): AuthorizationCode {
        let domainObject = new AuthorizationCode();
        domainObject['_id'] = dataObject.id
        domainObject['_subject'] = dataObject.subject
        domainObject['_created'] = new Date(dataObject.created)

        return domainObject;
    }

    toDataObject(businessObject: AuthorizationCode): IAuthorizationCodeDataObject {
        return <IAuthorizationCodeDataObject>{
            id: businessObject.id,
            subject: businessObject.subject,
            created: businessObject.created.getTime(),
            expires: moment(businessObject.created).add(1, 'h').date()
        }
    }
}
