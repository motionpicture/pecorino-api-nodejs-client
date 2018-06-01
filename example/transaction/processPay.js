/**
 * 支払取引サンプル
 */
const moment = require('moment');
const readline = require('readline');
const util = require('util');
const pecorinoapi = require('../../lib/');

const auth = new pecorinoapi.auth.ClientCredentials({
    domain: process.env.TEST_AUTHORIZE_SERVER_DOMAIN,
    clientId: process.env.TEST_CLIENT_ID,
    clientSecret: process.env.TEST_CLIENT_SECRET,
    scopes: []
});
const payService = new pecorinoapi.service.transaction.Pay({
    endpoint: process.env.TEST_API_ENDPOINT,
    auth: auth
});

async function main() {
    const { fromAccountNumber, amount, notes } = await new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('支払元の口座番号を入力してください。\n', async (fromAccountNumber) => {
            rl.question('支払金額を入力してください。\n', async (amount) => {
                rl.question('取引説明を入力してください。\n', async (notes) => {
                    rl.close();
                    resolve({ fromAccountNumber, amount, notes });
                });
            });
        });
    });

    // 取引開始
    const transaction = await payService.start({
        expires: moment().add(10, 'minutes').toISOString(),
        agent: {
            name: 'agentName'
        },
        recipient: {
            typeOf: 'Person',
            id: 'recipientId',
            name: 'recipientName',
            url: 'https://example.com'
        },
        amount: amount,
        notes: notes,
        fromAccountNumber: fromAccountNumber
    });
    console.log('取引が開始されました。', transaction.id);

    await wait(1000);

    // 中止の場合
    // await payService.cancel({
    //     transactionId: transaction.id
    // });
    // console.log('取引を中止しました。');

    // 確定
    await payService.confirm({
        transactionId: transaction.id
    });
    console.log('取引確定です。');
}

async function wait(waitInMilliseconds) {
    return new Promise((resolve) => setTimeout(resolve, waitInMilliseconds));
}

main().then(() => {
    console.log('main processed.');
}).catch((err) => {
    console.error(err);
});