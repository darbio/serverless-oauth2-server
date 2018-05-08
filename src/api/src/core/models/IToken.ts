import { IUser } from './IUser';

export interface IUserToken {
    id: string;
    type: "access" | "id";
    clientId: string;
    issuer: string;
    user: IUser;
    created: Date;
    expires: Date;

    toJwt(secret: string): string;
}
