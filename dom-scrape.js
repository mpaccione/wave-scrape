class transactionsByAccount {
    constructor() {
        this.accName = document.querySelector('.transactions-list-V2__account-picker__toggle__account-name').innerText;
        this.nodeList = document.querySelectorAll('.transactions-list-v2__row');
        this.rows = Array.from(this.nodeList).map(r => {
            let amount, category;

            try {
                amount = r.querySelector(`.transactions-list-v2__row__amount--positive`).innerText;
                amount = parseFloat(amount.substr(1))
            } catch (err) {
                amount = r.querySelector(`.transactions-list-v2__row__amount`).innerText;
                amount = parseFloat(amount.substr(1)) * - 1
            }

            category = r.querySelector(`.transactions-list-v2__row__category`).innerText;

            return {
                amount,
                category,
            }
        });
    }

    getLoss() {
        const report = {}
        this.rows.filter(r => r.amount < 0).forEach(r => report[r.category] -= r.amount)
        return report
    }

    getProfit() {
        const report = {}
        this.rows.filter(r => r.amount > 0).forEach(r => report[r.category] += r.amount)
        return report
    }
}


