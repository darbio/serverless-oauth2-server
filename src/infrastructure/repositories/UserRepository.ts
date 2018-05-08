import { IExternalIdentity, IIdentity, IInternalIdentity, IUser } from '../../core/models/IUser';
import { IUserRepository } from '../../core/repositories/IUserRepository';
import { ExternalIdentity, InternalIdentity, User } from '../models/User';
import { DynamoDbRepository } from './DynamoDbRepository';

interface IUserDataObject {
    id: string;
    identities: IUserIdentityDataObject[];

    emailAddress: string;
    emailVerified: boolean;

    name: string;
    givenName: string;
    familyName: string;

    pictureUrl?: string;
}

interface IUserIdentityDataObject {
    sub: string;
    type: "internal" | "external";
    passwordHash?: string;
    provider?: string;
}

export class UserRepository extends DynamoDbRepository<IUser>
    implements IUserRepository {
    constructor() {
        super(process.env.USERS_TABLE_NAME);
    }

    toDomainObject(dataObject: IUserDataObject): User {
        let user = new User();
        user["_id"] = dataObject.id;
        user["_identities"] = dataObject.identities.map((item): IIdentity => {
            let identity: IIdentity;
            if (item.type == "internal") {
                let typedIdentity = new InternalIdentity();
                typedIdentity["_passwordHash"] = item.passwordHash;
                identity = typedIdentity;
            } else {
                let typedIdentity = new ExternalIdentity();
                typedIdentity["_provider"] = item.provider;
                identity = typedIdentity;
            }

            identity["_sub"] = item.sub;
            identity["_type"] = item.type;

            return identity;
        });

        user["_emailAddress"] = dataObject.emailAddress;
        user["_emailVerified"] = dataObject.emailVerified;

        user["_name"] = dataObject.name;
        user["_givenName"] = dataObject.givenName;
        user["_familyName"] = dataObject.familyName;

        user["_pictureUrl"] = dataObject.pictureUrl;

        return user;
    }

    toDataObject(businessObject: IUser): IUserDataObject {
        let dataObject: IUserDataObject = {
            id: businessObject.id,
            identities: businessObject.identities.map(
                (item): IUserIdentityDataObject => {
                    let data = <IUserIdentityDataObject>{
                        sub: item.sub,
                        type: item.type
                    };
                    if (item.type === "internal") {
                        let typedItem = item as IInternalIdentity;
                        data.passwordHash = typedItem["_passwordHash"];
                    } else {
                        let typedItem = item as IExternalIdentity;
                        data.provider = typedItem.provider;
                    }
                    return data;
                }
            ),
            emailAddress: businessObject.emailAddress,
            emailVerified: businessObject.emailVerified,
            name: businessObject.name,
            givenName: businessObject.givenName,
            familyName: businessObject.familyName,
            pictureUrl: businessObject.pictureUrl
        };
        return dataObject;
    }
}
