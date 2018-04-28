export interface IToken {
    id: string
    type: 'access' | 'id'
    subject: string
    clientId: string
    claims: {
        [key: string]: string;
     }
    created: Date
    expires: Date

    toJwt(secret: string): string
}