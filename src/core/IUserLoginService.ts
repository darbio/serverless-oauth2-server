export interface IUserLoginService {
    login(username: string, password: string): Promise<boolean>
}