import { IAuthorizationCodeRepository } from "../../core/repositories/IAuthorizationCodeRepository";
import { IAuthorizationCode } from "../../core/IModel";
import { DynamoDyRepository } from "./DynamoDbRepository";

export class AuthorizationCodeRepository extends DynamoDyRepository<IAuthorizationCode>
    implements IAuthorizationCodeRepository {
}