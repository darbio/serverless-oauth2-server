import { ISessionRepository } from '../../core/repositories/ISessionRepository';
import { Session } from '../models/Session';
import { DynamoDbRepository } from './DynamoDbRepository';

interface ISessionDataObject {
    id: string;
    clientId: string;
    responseType: "code" | "token";
    redirectUri: string;
    state?: string;
    created: number;
    expires: number;
}

export class SessionRepository extends DynamoDbRepository<Session>
    implements ISessionRepository {
    constructor() {
        super(process.env.SESSIONS_TABLE_NAME);
    }

    toDomainObject(dataObject: ISessionDataObject): Session {
        let session = new Session();

        session["_id"] = dataObject.id;
        session["_clientId"] = dataObject.clientId;
        session["_responseType"] = dataObject.responseType;
        session["_redirectUri"] = dataObject.redirectUri;
        session["_state"] = dataObject.state;
        session["_created"] = new Date(dataObject.created * 1000);
        session["_expires"] = new Date(dataObject.expires * 1000);

        return session;
    }

    toDataObject(businessObject: Session): ISessionDataObject {
        return {
            id: businessObject.id,
            clientId: businessObject.clientId,
            responseType: businessObject.responseType,
            redirectUri: businessObject.redirectUri,
            state: businessObject.state,
            created: businessObject.created.getTime() / 1000,
            expires: businessObject.expires.getTime() / 1000
        };
    }
}
