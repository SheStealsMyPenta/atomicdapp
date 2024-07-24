import * as bitcoin from '../bitcoinjs-lib';
import * as Buffer from '../safe-buffer';
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs"
import * as ecpair from 'ecpair'
import { action_swapBtc2Stark, baseUrl, expire_block, factory_contract_address, token_contract_address } from '../static/Const';
import axios from 'axios'
import { Contract } from 'starknet';
import { RpcProvider } from 'starknet';
import bigInt from 'big-integer';
import { message } from 'antd';
import { json } from 'starknet';

/**
 *  btc 锁定脚本，用于发布加锁脚本到testnet
 * @param {*} param 
 * @returns 
 */
// export async function lockMoneyIntoBTCScript(param) {
//     try {
//         const TESTNET = bitcoin.networks.testnet;
//         const ECPair = ecpair.ECPairFactory(ecc);
//         // const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs", TESTNET)
//         const alice = ECPair.fromWIF(localStorage.getItem('btc_privatekey'), TESTNET)
//         const secretHash = param.secretHash;

//         const expiry = param.expiry;
//         const value = param.value;
//         console.log('param', param);
//         const vout = 0;
//         // const 
//         const lockingScript = bitcoin.script.compile([
//             bitcoin.opcodes.OP_IF,
//             bitcoin.opcodes.OP_SHA256,
//             secretHash,
//             bitcoin.opcodes.OP_EQUALVERIFY,
//             bitcoin.opcodes.OP_DUP,
//             bitcoin.opcodes.OP_HASH160,
//             bitcoin.crypto.hash160(Buffer.Buffer.from(param.node_btcpublickey, 'hex')),
//             bitcoin.opcodes.OP_ELSE,
//             bitcoin.script.number.encode(expiry).toString('hex'),
//             bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
//             bitcoin.opcodes.OP_DROP,
//             bitcoin.opcodes.OP_DUP,
//             bitcoin.opcodes.OP_HASH160,
//             bitcoin.crypto.hash160(alice.publicKey),
//             bitcoin.opcodes.OP_ENDIF,
//             bitcoin.opcodes.OP_EQUALVERIFY,
//             bitcoin.opcodes.OP_CHECKSIG
//         ]);
//         const p2shAddress = bitcoin.payments.p2sh({
//             redeem: { output: lockingScript },
//             network: TESTNET
//         });
//         const redeemTx = new bitcoin.Transaction(TESTNET);
//         const txIds = param.tx_ids;
//         redeemTx.addInput(Buffer.Buffer.from('cba3a8e6c340be2dff29d0001c83643ef55e353a8e2bca53bea3b4117ad8bb7c', 'hex').reverse(), vout);
//         redeemTx.addInput(Buffer.Buffer.from('2180b01926ae720786b48ad4031b08472a2363de925b49ed53966a16d318c04a', 'hex').reverse(), vout);
//         redeemTx.addOutput(bitcoin.address.toOutputScript(p2shAddress.address, TESTNET)
//             , value);
//         const hashType = bitcoin.Transaction.SIGHASH_ALL;
//         const utxoAddress = bitcoin.payments.p2pkh({ pubkey: alice.publicKey, network: TESTNET });
//         const p2pkhScriptPubKey = bitcoin.address.toOutputScript(utxoAddress.address, TESTNET);
//         const signatureHash = redeemTx.hashForSignature(0, p2pkhScriptPubKey, hashType);
//         //这里以上是正确的
//         // 签署第二个输入
//         let signatureHash1 = redeemTx.hashForSignature(1, p2pkhScriptPubKey, hashType);
//         let signature1 = bitcoin.script.signature.encode(alice.sign(signatureHash1), hashType);
//         // const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
//         // const unisatSignature = await window.unisat.signMessage(signatureHash.toString('hex'));
//         const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
//         const scriptSig = bitcoin.script.compile([
//             signature,
//             alice.publicKey
//         ]);
//         const scriptSig1 = bitcoin.script.compile([
//             signature1,
//             alice.publicKey
//         ]);
//         redeemTx.setInputScript(0, scriptSig);
//         redeemTx.setInputScript(1, scriptSig1);
//         // console.log(redeemTx.toHex(), 'redeemTx.toHex()');
//         return await broadcastTransaction(redeemTx.toHex())
//     } catch (error) {
//         console.log('script Error', error);
//         return {
//             tx_id: '',
//             code: 300,
//             error: 'gasfee to hight , utxo balance not enought to pay gasfee'
//         }
//     }
// }
export async function lockMoneyIntoBTCScript(param) {
    //         const TESTNET = bitcoin.networks.testnet;
    //         const ECPair = ecpair.ECPairFactory(ecc);
    //         // const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs", TESTNET)
    //         const alice = ECPair.fromWIF(localStorage.getItem('btc_privatekey'), TESTNET)
    //         const secretHash = param.secretHash;

    const TESTNET = bitcoin.networks.testnet;
    const ECPair = ecpair.ECPairFactory(ecc);
    const alice = ECPair.fromWIF(localStorage.getItem('btc_privatekey'), TESTNET);

    const secretHash = Buffer.Buffer.from(param.secretHash, 'hex');
    const txIds = param.tx_ids;
    const expiry = expire_block;
    const value = param.value;
    const vout = 0;
    let utxo_amount = 0;
    txIds.forEach((tx, index) => {
        utxo_amount += tx.value
    });
    console.log('param', param);
    const lockingScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_IF,
        bitcoin.opcodes.OP_SHA256,
        secretHash,
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(Buffer.Buffer.from(param.node_btcpublickey, 'hex')),
        bitcoin.opcodes.OP_ELSE,
        bitcoin.script.number.encode(expiry).toString('hex'),
        bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
        bitcoin.opcodes.OP_DROP,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(alice.publicKey),
        bitcoin.opcodes.OP_ENDIF,
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_CHECKSIG
    ]);

    const p2shAddress = bitcoin.payments.p2sh({
        redeem: { output: lockingScript },
        network: TESTNET
    });
    const aliceAddress = bitcoin.payments.p2pkh({
        pubkey: alice.publicKey,
        network: TESTNET
    });

    const redeemTx = new bitcoin.Transaction();

    txIds.forEach(txId => {
        redeemTx.addInput(Buffer.Buffer.from(txId.txId, 'hex').reverse(), txId.vout);
    });

    redeemTx.addOutput(bitcoin.address.toOutputScript(p2shAddress.address, TESTNET), value);
    if(utxo_amount - value - param.btcGasFee >0 ){
        console.log("remain",utxo_amount - value - param.btcGasFee);
        redeemTx.addOutput(bitcoin.address.toOutputScript(aliceAddress.address, TESTNET), utxo_amount - value- param.btcGasFee);
    }
  

    const hashType = bitcoin.Transaction.SIGHASH_ALL;
    const utxoAddress = bitcoin.payments.p2pkh({ pubkey: alice.publicKey, network: TESTNET });
    const p2pkhScriptPubKey = bitcoin.address.toOutputScript(utxoAddress.address, TESTNET);

    const p2pkhScriptPubKey1 = bitcoin.address.toOutputScript(aliceAddress.address, TESTNET);
    txIds.forEach((txId, index) => {
        const signatureHash = redeemTx.hashForSignature(index, p2pkhScriptPubKey, hashType);
        const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
        const scriptSig = bitcoin.script.compile([signature, alice.publicKey]);
        redeemTx.setInputScript(index, scriptSig);
        if(utxo_amount - value - param.btcGasFee >0 ){
            const signatureHash1= redeemTx.hashForSignature(index, p2pkhScriptPubKey1, hashType);
            const signature1 = bitcoin.script.signature.encode(alice.sign(signatureHash1), hashType);
            const scriptSig1 = bitcoin.script.compile([signature1, alice.publicKey]);
            redeemTx.setInputScript(index, scriptSig1);
        }
    
    });

    // console.log(redeemTx.toHex());

    // 假设 broadcastTransaction 是一个正确实现的函数
    return await broadcastTransaction(redeemTx.toHex());
}
export function getBtcAcc() {
    try {
        const TESTNET = bitcoin.networks.testnet;
        const ECPair = ecpair.ECPairFactory(ecc);
        // const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs", TESTNET)
        const alice = ECPair.fromWIF(localStorage.getItem('btc_privatekey'), TESTNET)
        return alice.publicKey.toString('hex')
    } catch (error) {
        return null
    }

}
/**
 *  btc 解锁脚本，用于解锁BTC到账户
 */

//privateKey, origin_secret, value = 10000, txId,node_btcpublickey
export async function unLockMoneyIntoBTCAccount(param) {
    try {
        const TESTNET = bitcoin.networks.testnet;
        const ECPair = ecpair.ECPairFactory(ecc);
        const alice = ECPair.fromWIF(
            param.btc_privatekey, TESTNET
        );
        const address = bitcoin.payments.p2pkh({
            pubkey: alice.publicKey,
            network: TESTNET,
        });
        console.log("param1", param);
        // const txId = "b784f0cf0adced5d0679ef5d195b941498fc78ef65cd10efe9fd2e685bc7a311";
        // const txId='f1add27c565fbc58035af61bb027227b7607ab1258cbc5b3eb1594199b2b1de0'
        const vout = 0;
        // const value = 10000; 
        // const secret = "123"; 
        // const secretHash = bitcoin.crypto.sha256("123");// 

        const secret = Buffer.Buffer.from(param.origin_secret, 'utf-8');

        const secretHash = bitcoin.crypto.sha256(secret);// 
        console.log('param1', secretHash.toString());

        const expiry = expire_block;

        const lockingScript = bitcoin.script.compile([
            bitcoin.opcodes.OP_IF,
            bitcoin.opcodes.OP_SHA256,
            secretHash,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(alice.publicKey),
            // Buffer.from('BA10CB2EF7711FFBA88813574A86319EBDBF2766','hex'),
            bitcoin.opcodes.OP_ELSE,
            bitcoin.script.number.encode(expiry).toString('hex'),
            bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
            bitcoin.opcodes.OP_DROP,
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(Buffer.Buffer.from(param.node_btcpublickey, 'hex')),
            // Buffer.from('BA10CB2EF7711FFBA88813574A86319EBDBF2766','hex'),
            bitcoin.opcodes.OP_ENDIF,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);



        const p2shAddress = bitcoin.payments.p2sh({
            redeem: { output: lockingScript },
            network: TESTNET
        });
        console.log(alice.publicKey);
        console.log('p2shAddress :', p2shAddress.address);


        const redeemTx = new bitcoin.Transaction(TESTNET);

        redeemTx.addInput(Buffer.Buffer.from(param.tx_id, 'hex').reverse(), vout);

        redeemTx.addOutput(bitcoin.address.toOutputScript(address.address, TESTNET), param.value);




        const hashType = bitcoin.Transaction.SIGHASH_ALL;

        const signatureHash = redeemTx.hashForSignature(0, lockingScript, hashType);

        const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);



        const redeemScriptSig = bitcoin.payments.p2sh({
            redeem: {
                input: bitcoin.script.compile([
                    signature,
                    alice.publicKey,
                    secret,
                    bitcoin.opcodes.OP_TRUE,
                ]),
                output: lockingScript
            },
            network: TESTNET,
        }).input;
        redeemTx.setInputScript(0, redeemScriptSig);
        console.log('Redeem Tx Hex:', redeemTx.toHex());
        return await broadcastTransaction(redeemTx.toHex())
    } catch (error) {
        console.log('script Error', error);
        return {
            tx_id: '',
            code: 300,
            error: 'gasfee to hight , utxo balance not enought to pay gasfee'
        }
    }
}
//privateKey, origin_secret, value = 10000, txId,node_btcpublickey
export async function unLockMoneyIntoBTCAccount_withdraw(param) {
    try {
        const TESTNET = bitcoin.networks.testnet;
        const ECPair = ecpair.ECPairFactory(ecc);
        const alice = ECPair.fromWIF(
            param.btc_privatekey, TESTNET
        );
        const address = bitcoin.payments.p2pkh({
            pubkey: alice.publicKey,
            network: TESTNET,
        });
        console.log("param1", param);
        // const txId = "b784f0cf0adced5d0679ef5d195b941498fc78ef65cd10efe9fd2e685bc7a311";
        // const txId='f1add27c565fbc58035af61bb027227b7607ab1258cbc5b3eb1594199b2b1de0'
        const vout = 0;
        // const value = 10000; 
        // const secret = "123"; 
        // const secretHash = bitcoin.crypto.sha256("123");// 

        const secret = Buffer.Buffer.from(param.origin_secret, 'utf-8');

        const secretHash = bitcoin.crypto.sha256(secret);// 
        console.log('param1', secretHash.toString());

        const expiry = expire_block;

        const lockingScript = bitcoin.script.compile([
            bitcoin.opcodes.OP_IF,
            bitcoin.opcodes.OP_SHA256,
            secretHash,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(Buffer.Buffer.from(param.node_btcpublickey, 'hex')),
            // Buffer.from('BA10CB2EF7711FFBA88813574A86319EBDBF2766','hex'),
            bitcoin.opcodes.OP_ELSE,
            bitcoin.script.number.encode(expiry),
            bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
            bitcoin.opcodes.OP_DROP,
            bitcoin.opcodes.OP_DUP,
            bitcoin.opcodes.OP_HASH160,
            bitcoin.crypto.hash160(alice.publicKey),
            // Buffer.from('BA10CB2EF7711FFBA88813574A86319EBDBF2766','hex'),
            bitcoin.opcodes.OP_ENDIF,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);



        const p2shAddress = bitcoin.payments.p2sh({
            redeem: { output: lockingScript },
            network: TESTNET
        });
        console.log(alice.publicKey);
        console.log('p2shAddress :', p2shAddress.address);


        const redeemTx = new bitcoin.Transaction(TESTNET);

        redeemTx.addInput(Buffer.Buffer.from(param.tx_id, 'hex').reverse(), vout);

        redeemTx.addOutput(bitcoin.address.toOutputScript(address.address, TESTNET), param.value);




        const hashType = bitcoin.Transaction.SIGHASH_ALL;

        const signatureHash = redeemTx.hashForSignature(0, lockingScript, hashType);

        const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);



        const redeemScriptSig = bitcoin.payments.p2sh({
            redeem: {
                input: bitcoin.script.compile([
                    signature,
                    alice.publicKey,
                    bitcoin.opcodes.OP_FALSE
                ]),
                output: lockingScript
            },
            network: TESTNET,
        }).input;
        redeemTx.setInputScript(0, redeemScriptSig);
        console.log('Redeem Tx Hex:', redeemTx.toHex());
        return await broadcastTransaction(redeemTx.toHex())
    } catch (error) {
        console.log('script Error', error);
        return {
            tx_id: '',
            code: 300,
            error: 'gasfee to hight , utxo balance not enought to pay gasfee'
        }
    }
}
/**
 * 广播BTC脚本
 * @param {*} rawTransaction 
 * @returns 
 */
const broadcastTransaction = async (rawTransaction) => {
    try {
        const response = await axios.post('https://mempool.space/testnet/api/tx', rawTransaction, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return {
            tx_id: response.data,
            code: 200,
        }
    } catch (error) {
        console.log(error.response.data, 'error');
        return {
            tx_id: '',
            code: 300,
            error: error && error.response && error.response.data
        }
    }
};

/**
 * 提交订单，
 * @param {*} param 
 */
export async function synch_makeorder(param) {
    const data = {
        node_id: param.nodeid,
        swaptype: param.swaptype,
        timestamp: new Date(),
        user_btcaddress: param.btcAddress,
        user_strkaddress: param.strkAddress,
        amount_in: param.amount_in,
        amount_out: param.amount_out,
        transaction_hash: param.transaction_hash,
        hashlock: param.hashlock,
        node_btcaddress: param.node_btcaddress,
        node_strkaddress: param.node_strkaddress,
        node_btc_publickey: param.node_btc_publickey,
        user_btc_publickey: param.user_btc_publickey
    }
    // console.log(data, 'data');
    try {
        saveOrder(param)
        const response = await fetch(baseUrl + 'api/v1/makeorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 200) {
            // deleteOrder(param)
            throw new Error('Network response was not ok');
        }
        // if (!response.ok) {
        // }
        deleteOrder(param)
        return response.ok
    } catch (error) {
        console.error('Error:', error);
        return false

    }
}
function saveOrder(data) {
    try {
        let order_param = localStorage.getItem('order_param')
        if (!order_param) {
            order_param = {}
        } else {
            order_param = JSON.parse(order_param)
        }
        order_param[data.transaction_hash] = data
        console.log("11", order_param);
        localStorage.setItem('order_param', JSON.stringify(order_param))

    } catch (error) {
        console.log("失败缓存");
        return null
    }

}
export function getOrders() {
    const order_params = localStorage.getItem('order_param')
    if (!order_params) return null
    return JSON.parse(order_params)
}

function deleteOrder(data) {
    try {
        let order_param = localStorage.getItem('order_param')
        if (!order_param) return
        order_param = JSON.parse(order_param)
        delete order_param[data.transaction_hash]
        localStorage.setItem('order_param', JSON.stringify(order_param))
        // console.log("删除");
    } catch (error) {
        return null
    }

}
/**
 * 获取账户utxo
 */
// export async function getUTXOList(address) {
//     const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`;
//     try {
//         const response = await axios.get(url, {
//             params: {
//                 limit: 20,
//                 unspentOnly: true,
//                 includeScript: true
//             }
//         });
//         // const tx = response.data.txs;
//         // tx.map(item => {
//         //     item.outputs.map
//         // })
//         console.log('utxo', response.data);
//         return response.data;
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }

// }
/**
 * 获取账户utxo
 */
export async function getUTXOList(address) {
    try {
        // const myFetch =  (await import('node-fetch')).default
        //https://api.blockcypher.com/v1/btc/test3/addrs/mvTvecvEkismv1iAE82ra8rjJfUWMemUmc/full?limit=10&unspentOnly=true&includeScript=true
        const result = await axios.get(`https://mempool.space/testnet/api/address/${address}/utxo`)
        return result.data;

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

}
//unit: satoshi
// export async function findRightUtxo(user_btcaddress, spend_amount, gasFee) {
//     try {
//         const data = await getUTXOList(user_btcaddress)
//         // const price =await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=STRATBTC')
//         // console.log(price,'price');
//         // const filteredData = data.txs.filter(item => item.inputs && item.inputs[0].addresses[0] === user_btcaddress)
//         const txs = data.txs
//         // console.log("utxo",txs);
//         //每一个tx都是一个可以花费的。找到那个output 的value 作为自己的utxo
//         let finded = null
//         txs.map(tx => {
//             const input = tx.inputs && tx.inputs[0]
//             tx.outputs && tx.outputs.map(output => {
//                 output.addresses && output.addresses.map(address => {
//                     if (address == user_btcaddress) {
//                         //检查是否是合格的utxo
//                         if (output.spent_by) return;
//                         console.log(output.value, spend_amount, tx.inputs[0].prev_hash, tx, 'utxo');
//                         if (output.value >= (spend_amount + 2 * gasFee)) {
//                             // console.log("utxo tx.inpus", tx.inputs[0].prev_hash);
//                             console.log('find!', tx.hash);
//                             finded = tx.hash
//                         }

//                     }
//                 })

//             })
//         })
//         return finded
//     } catch (error) {
//         return null
//     }
// }
export async function findRightUtxo(user_btcaddress, spend_amount, gasFee) {
    try {
        const data = await getUTXOList(user_btcaddress)
        console.log('data', data);
        for (let i = 0; i < data.length; i++) {
            if (data[i].value > (spend_amount + gasFee)) {

                return data[i].txid
            }
        }
    } catch (error) {
        return null
    }
}
//找到合适的UTXOS
export async function findRightUtxos(user_btcaddress, spend_amount, gasFee) {
    try {
        const utxos = await getUTXOList(user_btcaddress)
        // console.log(utxos,'selectedUTXOs');
        // 对UTXO列表按照金额从小到大排序
        utxos.sort((a, b) => a.value - b.value);
        let selectedUTXOs = [];
        let total = 0;
        for (let utxo of utxos) {
            selectedUTXOs.push({
                txId: utxo.txid,
                vout: utxo.vout,
                value: utxo.value
            });
            total += utxo.value;
            // 如果总金额已经足够，则退出循环
            if (total >= spend_amount + gasFee) {
                break;
            }
        }
        // 检查是否找到足够的UTXO
        if (total < spend_amount) {
            throw new Error("Insufficient UTXOs to cover the amount");
        }

        console.log('selectedUTXOs', selectedUTXOs);
        return selectedUTXOs;
    } catch (error) {
        console.log(error);
        return null;
    }
}
/**
 * 获取合约授权的余额
 * @param {*} starknet_address 
 * @returns 
 */
export async function get_strk_Token_allowance(starknet_address) {

    const provider = new RpcProvider({
        nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
    })


    const { abi: testAbi } = await provider.getClassAt(token_contract_address);


    if (testAbi === undefined) {
        throw new Error('no abi.');
    }
    const myTestContract = new Contract(testAbi, token_contract_address, provider);

    // Interaction with the contract with cmeall
    let allowance = await myTestContract.allowance(starknet_address, factory_contract_address);

    console.log('allowance =', { allowance });

    try {
        if (allowance !== '0x0') {
            // const decimalAllowance = parseInt(allowance, 16);
            const bigIntAllowance = bigInt(allowance);
            const dividedNumber = bigIntAllowance / bigInt(10 ** 18);
            return dividedNumber;
        } else {
            console.log('Allowance is 0');
            return 0;
        }
    } catch {
        return 0;
    }

}

/**
 * 获取通过工厂合约生成的新合约的地址，用于进行claim
 * @param {} transaction_hash 
 * @returns 
 */
export async function get_transactionhash_result(transaction_hash, starknet_address) {

    const provider = new RpcProvider({
        // nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno/"
        nodeUrl: "https://starknet-sepolia.public.blastapi.io"
    })
    let result = await provider.waitForTransaction(transaction_hash);
    console.log('result', result.events, starknet_address);
    let atomic_child_contract = result.events.find(event => event.from_address === starknet_address)?.data[2];
    console.log('result', atomic_child_contract);
    return atomic_child_contract
}

/**
 * 交易成功，更新订单状态位Succeed
 */
export async function claim_money_succeed(param) {

    return await axios.post(baseUrl + 'api/v1/orderSucceed', param)

}
/**
 * 交易成功，更新订单状态位Succeed
 */
export async function withdraw_money_succeed(param) {

    return await axios.post(baseUrl + 'api/v1/orderStatus', param)

}
/**
 * 获取交易订单列表
 */
export async function get_order_list(btcAddress, userSTRKAddress) {
    // const url = baseUrl + `api/v1/userOrder?user_btcaddress=${btcAddress}&user_strkaddress=${userSTRKAddress}`;
    let url = baseUrl + 'api/v1/userOrder?';

    // 根据传入参数情况构建URL
    const params = [];
    if (btcAddress) {
        params.push(`user_btcaddress=${btcAddress}`);
    }
    if (userSTRKAddress) {
        params.push(`user_strkaddress=${userSTRKAddress}`);
    }

    url += params.join('&');
    const response = await fetch(url);
    const data = await response.json();
    return data.reverse()
}
/**
 * 获取交易完成订单列表
 */
export async function get_order_list_succeed() {
    const url = baseUrl + `api/v1/userOrderSucceed`;
    const response = await fetch(url);
    const data = await response.json();
    return data.reverse()
}
/**
 * 获取BTC价格
 * @returns 
 */
export async function getBTCPrice() {
    const response = await fetch('https://api.coinpaprika.com/v1/tickers/btc-bitcoin');
    const data = await response.json();
    const btcPrice = data.quotes.USD.price;
    return btcPrice
}
export async function updateNodeListIncreaseTvl(param) {
    console.log('updateNodeListIncreaseTvl', param);
    const response = await axios.post(baseUrl + 'api/v1/updateNodelistIncreaseTvl', param)
    return response
}
//获取gasfee 
export async function getBtcGasFee(address) {
    try {
        const response = await fetch('https://mempool.space/testnet/api/v1/fees/recommended');
        const data = await response.json();
        //解决min Fee问题
        let gasFee = data
        if (gasFee.economyFee <= 2) {
            gasFee.economyFee = 2
        }
        if (address) {
            updateNodeListSetGasFee({
                bitcoin_address: address,
                btc_gas_fee: gasFee.economyFee
            })
        }
        return gasFee
    } catch (error) {
        //从服务器获取
        if (address) {
            return await getNodeListGasFee(address)
        }
        return {}
    }

}
export async function updateNodeListSetGasFee(param) {
    try {
        const response = await axios.post(baseUrl + 'api/v1/updateNodeListSetGasFee', param)
        return response.data
    } catch (error) {

    }
}
export async function getNodeListGasFee(address) {
    try {
        const response = await axios.get(baseUrl + 'api/v1/getBtcGasFee?btcAddress=' + address)
        console.log('btc_gas_fee', response.data && response.data[0].btc_gas_fee);
        return {
            economyFee: response.data && response.data[0].btc_gas_fee
        }
    } catch (error) {
        return null
    }
}