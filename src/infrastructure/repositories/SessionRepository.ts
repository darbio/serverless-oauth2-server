import { ISessionRepository } from "../../core/repositories/ISessionRepository";
import { ISession } from "../../core/IModel";
import { DynamoDyRepository } from "./DynamoDbRepository";

export class SessionRepository extends DynamoDyRepository<ISession>
    implements ISessionRepository {
}