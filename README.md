# IDP - Identity Server

An OAuth2 ID Provider using serverless, running on AWS lambda with a dynamodb backend.

## Running locally

Use `npm start` to spin up a local instance of serverless running the identity provider.

## Deploying to AWS

Use `sls deploy --stage dev --profile darb.io` to deploy to aws.

## Model

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
`jwtSecret` is used to sign the JWTs and can be shared with the client to verify JWTs.
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
  "clientSecret": "CLIENT_SECRET",
  "callbackUrl": "http://idp.tld/callback/PROVIDER_ID"
}
```
