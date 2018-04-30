export interface IClient {
    id: string;
    secret?: string;
    redirectUris?: string[];
    grantType: string;
}
