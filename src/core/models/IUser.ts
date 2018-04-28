export interface IUser {
    id: string;
    login(password: string): boolean;
}
