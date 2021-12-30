import { v4 as uuidv4 } from 'uuid';
import { Account } from './Account';
import { User, UserProjection } from './User';

export interface Token {
    value: string
}

class UserStorage {
    map: Map<String, User> = new Map();

    createUser(name: string): Token {
        let token = uuidv4();
        this.map.set(token, new User(name, token));
        return { value: token };
    }

    createAccount(userId: Token): Token {
        const user: User = this.map.get(userId.value);
        let token = uuidv4();
        user.linkAccount(new Account(token));
        return { value: token };
    }

    getUser(token: Token): UserProjection {
        let user: User = this.map.get(token.value);
        return new UserProjection(user);
    }

    getUsers() {
        return Array.from(this.map, ([, user]) => (new UserProjection(user)))
    }

    addFunds(userId: Token, accountId: Token, amount: number): Boolean {
        const user: User = this.map.get(userId.value);
        
        let account: Account = user.corelatedAccounts.get(accountId.value);
        let added = account.addFunds(amount)
        if(this.checkProblematicBalance(user)){
                Array.from(user.corelatedAccounts.values()).forEach(account => {
                    account.blockAccount()
                })    
        }
        return ( added && !account.blocked )
    }

    private checkProblematicBalance(user: User): Boolean {
        const accounts: Account[] = Array.from(user.corelatedAccounts.values());
        let sum: number = accounts.reduce((accumulator, account) => {
            return accumulator + account.balance;
        }, 0);

        if (sum >= 50000) {
            return true;
        }
        return false;
    }

    deleteUser(userId: Token) {
        this.map.delete(userId.value);
    }

    deleteAccount(userId: Token, accountId: Token) {
        this.map.get(userId.value).corelatedAccounts.delete(accountId.value);
    }
}
export const userStore = new UserStorage();
