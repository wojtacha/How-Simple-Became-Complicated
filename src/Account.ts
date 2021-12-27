import { Token } from './storage';

export class Account {
    accountId: Token;
    balance: number;
    blocked: Boolean;

    constructor(uuid: Token) {
        this.accountId = uuid;
        this.balance = 0;
        this.blocked = false;
    }

    addFunds(amount: number): Boolean {
        if (!this.blocked) {
            const value = this.balance;
            this.balance = this.balance + amount;
        }
        return !this.blocked;
    }

    blockAccount() {
        this.blocked = true;
    }
}
