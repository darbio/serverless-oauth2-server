export interface IAuthorizationCode {
    id: string;
    subject: string;
    clientId: string;
    redirectUri: string;
    created: Date;
    expires: Date;

    isValid(): boolean;
}
