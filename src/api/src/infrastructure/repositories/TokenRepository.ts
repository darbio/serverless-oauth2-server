import { IUserToken } from '../../core/models/IToken';
import { ITokenRepository } from '../../core/repositories/ITokenRepository';
import { DynamoDbRepository } from './DynamoDbRepository';

interface ITokenDataObject {
    id: string;
    type: "access" | "id";
    subject: string;
    clientId: string;
    issuer: string;
    created: number;
    expires: number;
}

export class TokenRepository extends DynamoDbRepository<IUserToken>
    implements ITokenRepository {
    constructor() {
        super(process.env.TOKENS_TABLE_NAME);
    }

    toDomainObject(dataObject: ITokenDataObject): IUserToken {
        throw new Error("Not implemented");
    }

    toDataObject(businessObject: IUserToken): ITokenDataObject {
        return {
            id: businessObject.id,
            subject: businessObject.user.id,
            type: businessObject.type,
            clientId: businessObject.clientId,
            issuer: businessObject.issuer,
            created: businessObject.created.getTime() / 1000,
            expires: businessObject.expires.getTime() / 1000
        };
    }
}
