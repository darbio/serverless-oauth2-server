import {
    IUser
} from "../core/IModel";

export class User implements IUser {
    id: string

    constructor(params: {
        username: string,
        password: string
    }) {

    }

    isValid(): boolean {
        return true;
    }
}