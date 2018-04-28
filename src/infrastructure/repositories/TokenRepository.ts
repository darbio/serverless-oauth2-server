import { DynamoDbRepository } from "./DynamoDbRepository";
import { IToken } from "../../core/IModel";
import { ITokenRepository } from "../../core/repositories/ITokenRepository";
import { Token } from "../models/Token";

interface ITokenDataObject {
    id: string
    type: 'access' | 'id'
    subject: string
    clientId: string
    claims: {
        [key: string]: string;
     }
    created: number
    expires: number
}

export class TokenRepository extends DynamoDbRepository<IToken> implements ITokenRepository {
    constructor() {
        super('authorization_tokens')
    }

    toDomainObject(dataObject: ITokenDataObject): IToken {
        let token = new Token();

        token['_id'] = dataObject.id
        token['_type'] = dataObject.type
        token['_subject'] = dataObject.subject
        token['_clientId'] = dataObject.clientId
        token['_claims'] = dataObject.claims
        token['_created'] = new Date(dataObject.created)
        token['_expires'] = new Date(dataObject.expires)

        return token;
    }

    toDataObject(businessObject: IToken): ITokenDataObject {
        return <ITokenDataObject> {
            id: businessObject.id,
            type: businessObject.type,
            subject: businessObject.subject,
            clientId: businessObject.clientId,
            claims: businessObject.claims,
            created: businessObject.created.getTime(),
            expires: businessObject.expires.getTime()
        }
    }
}