import { v4 as uuidv4 } from 'uuid';
import { Account } from './Account';
import { User, UserProjection } from './User';

export interface Token {
    value: string
}

class UserStorage {
    map: Map<Token, User> = new Map();

    createUser(name: string): Token {
        let token = uuidv4();
        this.map.set(token, new User(name, token));
        return { value: token }
    }

    createAccount(userId: Token): Token | never {
        const user: User = this.map.get(userId);
        if(user==undefined){
            throw new Error(`User with given id: ${userId} does not exist`)
        }
        
        let token = uuidv4();
        user.linkAccount(new Account(token));
        return { value: token };
    }

    getUser(token: Token): User {
        return this.map.get(token);
    }

    getUsers() {
        return Array.from(this.map, ([, user]) => (new UserProjection(user)))
    }

    addFunds(userId: Token, accountId: Token, amount: number): Boolean {
        const user: User = this.map.get(userId);
        if(user==undefined){
            throw new TypeError(`User with given id: ${userId} does not exist`)
        }
        const account: Account = user.corelatedAccounts.get(accountId);
        if(account==undefined){
            throw new TypeError(`Account with given id: ${accountId} does not exist`)
        }
        return account.addFunds(amount)
    }

    deleteUser(userId: Token) {
        this.map.delete(userId);
    }
}
export const userStore = new UserStorage();

