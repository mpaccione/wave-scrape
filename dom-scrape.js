class transactionsByAccount {
    constructor() {
        const format = (amount) => {
            // remove dollar sign, commas, and whitespace
            const formatted = parseFloat(amount.replace(/[$,]/g, ''));

            if (isNaN(formatted)) {
                alert(`Transaction formatting has failed: ${amount} is ${formatted}`);
                throw new Error({ elem: this.nodeList[idx], row: this.rows[idx], amount, is: formatted })
            }

            return formatted;
        }

        this.accName = document.querySelector('.transactions-list-V2__account-picker__toggle__account-name').innerText;
        this.nodeList = document.querySelectorAll('.transactions-list-v2__row');
        this.rows = Array.from(this.nodeList).map((r, idx) => {
            let amount, category;

            if (r.querySelector(`.transactions-list-v2__row__amount--positive`)) {
                amount = r.querySelector(`.transactions-list-v2__row__amount--positive`).innerText;
                amount = format(amount, idx)
            } else {
                amount = r.querySelector(`.transactions-list-v2__row__amount`).innerText;
                amount = format(amount, idx) * -1
            }

            category = r.querySelector(`.transactions-list-v2__row__category`).innerText;

            return {
                amount,
                category,
            }
        });
    }

    getStatement(f) {
        const report = {}
        this.rows.filter(f).forEach(r => {
            if (r.category === 'Owner Investment / Drawings' || r.category === "Owner's Equity") {
                return console.warn(r)
            }

            if (!report.hasOwnProperty(r.category)) {
                report[r.category] = r.amount
            } else {
                report[r.category] += r.amount
            }
        })
        return report
    }

    downloadStatement() {
        const expense = this.getStatement((r) => r.amount < 0)
        const expenseSum = Object.values(expense).reduce((acc, curr) => acc + curr, 0)
        const income = this.getStatement((r) => r.amount > 0)
        const incomeSum = Object.values(income).reduce((acc, curr) => acc + curr, 0)
        
        const annual = expenseSum + incomeSum
        const monthly = annual / 12

        const jsonString = JSON.stringify({ account: this.accName, expense, income, annual, monthly }, null, 4);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = this.accName;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}


