import { IAuthorizeSession } from "./IModel";

interface save<T> {
    save(entity: T): Promise<void>
}

interface get<T, TId> {
    get(id: TId): Promise<T>
}

export interface IAuthorizationSessionRepository extends save<IAuthorizeSession>, get<IAuthorizeSession, string> {
}