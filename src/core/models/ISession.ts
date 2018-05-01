export interface ISession {
    id: string;
    clientId: string;
    responseType: "code" | "token";
    redirectUri: string;
    state?: string;
    created: Date;
    expires: Date;

    getLoginUrl(): string;
    isValid(): boolean;
}
