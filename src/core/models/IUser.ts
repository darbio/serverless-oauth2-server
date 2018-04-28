export interface IUser {
    id: string;
    claims: { [key: string]: string };
    login(password: string): boolean;
}
