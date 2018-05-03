import { DynamoDbRepository } from "./DynamoDbRepository";
import { IUserRepository } from "../../core/repositories/IUserRepository";
import { User, ExternalUser, InternalUser } from "../models/User";
import * as aws from "aws-sdk";
import { IUser, IExternalUser, IInternalUser } from "../../core/models/IUser";

interface IUserDataObject {
    id: string;
    passwordHash: string;
    provider: string;
    refreshToken: string;
    claims: { [key: string]: string };
    type: "internal" | "external";
}

export class UserRepository extends DynamoDbRepository<IUser>
    implements IUserRepository {
    constructor() {
        super("authorization_users");
    }

    toDomainObject(dataObject: IUserDataObject): User {
        let user: InternalUser | ExternalUser;

        if (dataObject.type === "internal") {
            user = new InternalUser();
            user["_passwordHash"] = dataObject.passwordHash;
        } else {
            user = new ExternalUser();
            user["_refreshToken"] = dataObject.refreshToken;
        }

        user["_id"] = dataObject.id;
        user["_claims"] = dataObject.claims;
        user["_type"] = dataObject.type;

        return user;
    }

    toDataObject(businessObject: IUser): IUserDataObject {
        let dataObject: IUserDataObject = <IUserDataObject>{
            id: businessObject.id,
            type: businessObject.type,
            claims: businessObject.claims
        };

        if (businessObject.type === "internal") {
            let user = businessObject as IInternalUser;
            dataObject.passwordHash = user["_passwordHash"];
        } else {
            let user = businessObject as IExternalUser;
            dataObject.refreshToken = user.refreshToken;
            dataObject.provider = user.provider;
        }

        return dataObject;
    }
}
