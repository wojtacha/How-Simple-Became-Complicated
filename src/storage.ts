import { v4 as uuidv4 } from 'uuid';

export interface XApiKeyToken {
    value: string
}

class UserStorage {
    map: Map<XApiKeyToken, User> = new Map();

    addUser(name: string): XApiKeyToken {
        let token = uuidv4();
        this.map.set(token, new User(name, token));
        return { value: token }
    }

    getUser(token: XApiKeyToken): User {
        return this.map.get(token);
    }

    addFunds() {

    }

    deleteUser() {

    }
}

class User {
    userId: XApiKeyToken;
    username: string;
    corelatedAccount: Account;

    constructor(name: string, userId: XApiKeyToken) {
        this.username = name;
        this.userId = userId;
        this.corelatedAccount = new Account(userId);
    }
}

class Account {
    correlatedUuid: XApiKeyToken;
    balance: number;

    constructor(correlatedUuid: XApiKeyToken) {
        this.correlatedUuid = correlatedUuid;
        this.balance = 0;
    }

    addFunds(amount: number) {
        this.balance = this.balance + amount;
    }

}

export const userStore = new UserStorage();

