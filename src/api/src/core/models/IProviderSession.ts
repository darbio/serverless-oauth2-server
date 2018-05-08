export interface IProviderSession {
    id: string;
    provider: string;
    sessionId: string;
    expires: Date;
    created: Date;

    isValid(): boolean;
}
