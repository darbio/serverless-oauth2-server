export interface IProvider {
    id: string;
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    profileUrl: string;
    scope: string[];
}
