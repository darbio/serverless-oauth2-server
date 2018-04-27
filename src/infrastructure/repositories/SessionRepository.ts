import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { DynamoDbRepository } from "./DynamoDbRepository";
import { Session } from "../models/Session";
import { ISession } from "../../core/IModel";

interface ISessionDataObject {
    id: string,
    responseType: 'code' | 'token'
    redirectUri: string
    state?: string
    created: number
}

export class SessionRepository extends DynamoDbRepository<ISession> implements ISessionRepository {
    constructor() {
        super('authorization_sessions')
    }

    toDomainObject(dataObject: ISessionDataObject): ISession {
        let session = new Session();
        session['_id'] = dataObject.id
        session['_responseType'] = dataObject.responseType
        session['_redirectUri'] = dataObject.redirectUri
        session['_state'] = dataObject.state
        session['_created'] = new Date(dataObject.created)

        return session;
    }

    toDataObject(businessObject: ISession): ISessionDataObject {
        return <ISessionDataObject>{
            id: businessObject.id,
            responseType: businessObject.responseType,
            redirectUri: businessObject.redirectUri,
            state: businessObject.state,
            created: businessObject.created.getTime()
        }
    }
}