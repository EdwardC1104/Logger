declare namespace Express {
    export interface User {
        id: number;
        username: string;
        email: string;
        passwordHash: string;
        passwordSalt: string;
    }
}
