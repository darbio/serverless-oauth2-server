export interface IClient {
    id: string;

    /**
     * The client secret
     */
    secret?: string;

    /**
     * Valid redirect uris for this client
     */
    redirectUris?: string[];

    /**
     * The grant types supported by this client
     */
    grantType: string;

    /**
     * The secret that the JWT is signed with
     */
    jwtSecret: string;
}
