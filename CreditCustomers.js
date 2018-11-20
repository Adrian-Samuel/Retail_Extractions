/* CSV Extracting Customers with OverDue Balances feom Lightspeed Retail
Criterium for Extraction:
1)Customer has a positive balance (owe more than 0)
2) Customer's first owing transaction was more than 30 days from the present date
3) Logs the last time they received a repayment

***Final Step***
USE AWS Lambda with Amazon Cloud Watch Events for scheduling
Connect Lamdba function to a DB to run function an all emails on DB

*/


const axios = require('axios');
const moment = require('moment');
const Json2csvParser = require('json2csv').Parser;
const secrets = require('secrets');

const instance = axios.create({
    baseURL: `https://api.lightspeedapp.com/API/Account/${secrets.accountID}`,
    timeout: 1000,
    headers: {
        Accept: 'application/json',
        Authorization: `${secrets.access_token}`
    }
});

(async () => {
    try {

        let offset = 0;
        let nextPage = true;
        let results = [];

        while (nextPage) {

            let res = await instance.get(`/CreditAccount.json?load_relations=all&offset=${offset}`);

            let result = res.data;

            if (result.hasOwnProperty('CreditAccount')) {
                results.push(...result.CreditAccount);
                offset += 100;
            } else {
                nextPage = false;
            }

        }
        const positiveBalance = results.filter(x => x.balance > 0 && x.hasOwnProperty('WithdrawalPayments'));

        let final = positiveBalance.map(x => {

            let data = {
                firstSpend: (() => {
                    let list = x.WithdrawalPayments.SalePayment;
                    if (Array.isArray(list)) {
                        return list[0].createTime.split('T')[0];

                    } else {
                        return list.createTime.split('T')[0];
                    }

                })(),
                name: x.name,
                Owe: (() => x.creditLimit === x.balance) ? Number(x.balance).toFixed(2) : (Number(x.creditLimit - x.balance)).toFixed(2)(),
                lastPayment: (() => {
                    let list = x.WithdrawalPayments.SalePayment;
                    if (Array.isArray(list)) {
                        if (list.filter(x => x.amount < 0)) {
                            let repayments = list.filter(x => x.amount < 0);
                            return lastRepayment = repayments[repayments.length - 1].createTime.split('T')[0]
                        }

                    } else {
                        return "Customer has never made a repayment"
                    }
                })()


            }
             if (moment().diff(data.firstSpend, 'days') > 30) {
                 data.overdue = `Overdue by ${moment().diff(data.firstSpend, 'days') - 30} days`;
             }
            return data;
        })

        let CSV = final.filter(x => moment().diff(x.firstSpend, 'days') > 30)
        console.log(CSV)

        const fields = Object.keys(CSV[0]);
        const opts = {
            fields
        };

        const parser = new Json2csvParser(opts);
        const exportMe = parser.parse(CSV);
        console.log(exportMe);


    } catch (err) {
        console.log(err)
    }

})()
