import { IUserLoginService } from "../core/IUserLoginService";

export class UserLoginService implements IUserLoginService {
    async login(username: string, password: string): Promise<boolean> {
        return password === "password";
    }
}
