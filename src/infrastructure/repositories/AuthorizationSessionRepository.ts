import { IAuthorizationSessionRepository } from "../../core/repositories/IAuthorizationSessionRepository";
import { IAuthorizationSession } from "../../core/IModel";
import { DynamoDyRepository } from "./DynamoDbRepository";

export class AuthorizationSessionRepository extends DynamoDyRepository<IAuthorizationSession>
    implements IAuthorizationSessionRepository {
}