import { Token } from './storage';
import { Account } from "./Account";

export class User {
    userId: Token;
    username: string;
    corelatedAccounts: Map<string, Account>;

    constructor(name: string, userId: Token) {
        this.username = name;
        this.userId = userId;
        this.corelatedAccounts = new Map();
    }

    linkAccount(acc: Account) {
        console.log("linking: " + acc)
        console.log("linking id: " + acc.accountId)
        this.corelatedAccounts.set(acc.accountId, acc);
    }
}

export class UserProjection{
    userId: Token;
    username: string;
    corelatedAccounts: Array<Account>;

    constructor(user:User){
        this.username = user.username;
        this.userId = user.userId;
        this.corelatedAccounts = Array.from(user.corelatedAccounts.values());
    }
}
