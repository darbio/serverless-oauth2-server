import { DynamoDbRepository } from "./DynamoDbRepository";
import { IUserRepository } from "../../core/repositories/IUserRepository";
import { User } from "../models/User";
import * as aws from "aws-sdk";

interface IUserDataObject {
    id: string;
    passwordHash: string;
    claims: { [key: string]: string };
}

export class UserRepository extends DynamoDbRepository<User>
    implements IUserRepository {
    constructor() {
        super("authorization_users");
    }

    toDomainObject(dataObject: IUserDataObject): User {
        let user = new User();

        user["_id"] = dataObject.id;
        user["_passwordHash"] = dataObject.passwordHash;
        user["_claims"] = dataObject.claims;

        return user;
    }

    toDataObject(businessObject: User): IUserDataObject {
        return <IUserDataObject>{
            id: businessObject.id,
            passwordHash: businessObject["_passwordHash"],
            claims: businessObject.claims
        };
    }
}
