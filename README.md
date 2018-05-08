# IDP - Identity Server

An OAuth2 ID Provider using serverless, running on AWS lambda with a dynamodb backend.

The project provides the following endpoints:

*   `authorize` - OAuth2 authorize endpoint.
*   `token` - OAuth2 token endpoint.
*   `providers/{providerId}` - Custom endpoint to send user to an external OAuth2 IDP.
*   `callback/{providerId}` - The callback for the external OAuth2 IDP to send the user to.
*   `login` - The User interface for the user to login with.

## Running locally

Use `npm start` to spin up a local instance of serverless running the identity provider.

## Deploying to AWS

Vanity scripts:

*   `npm run deploy:dev`
*   `npm run deploy:prod`

Under the covers:

Use `sls deploy --stage dev --aws-profile darb.io` to deploy to aws.

## Model

This project uses dynamodb to store the users, clients and providers in the tables `idp_users_$stage`, `idp_clients_$stage` and `idp_providers_$stage`. Dynamodb is also used as a temporary store for sessions, tokens and codes. When an entity has an `expires` attribute, a TTL is set on that attribute and it is deleted after that is reached.

*   Sessions expire after 5 minutes.
*   Codes expire after 5 minutes.
*   Tokens expire after 1 hour.

### Clients

```
{
  "id": "CLIENT_ID",
  "jwtSecret": "SECRET",
  "grantType": "authorization_code",
  "redirectUris": [
    "http://domain.io"
  ]
}
```

`id` is a unique string identifier for the client (e.g. guid).
`jwtSecret` is used to sign the JWTs and can be shared with the client to verify JWTs. This can be anything but it is recommended that it is a 256-bit key.
`grantType` is the type of grant allowed to be used by this client.
`redirectUris` are the allowed redirect URLs for this client.

### Providers

Providers are what provides the user to the server. E.g. local users, google etc.

```
{
  "id": "PROVIDER_ID",
  "clientId": "CLIENT_ID",
  "tokenUrl": "https://domain.tld/oauth2/token",
  "authorizationUrl": "https://domain.tld/oauth2/auth",
  "scope": [
    "profile",
    "email"
  ],
  "clientSecret": "CLIENT_SECRET"
}
```
