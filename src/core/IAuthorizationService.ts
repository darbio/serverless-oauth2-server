export interface IAuthorizationService {
    /**
     * Initiates the authorization flow
     */
    initiate(): string
}