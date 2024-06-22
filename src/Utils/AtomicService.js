import * as bitcoin from '../bitcoinjs-lib';
import * as Buffer from '../safe-buffer';
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs"
import * as ecpair from 'ecpair'
import { action_swapBtc2Stark, baseUrl, factory_contract_address, token_contract_address } from '../static/Const';
import axios from 'axios'
import { Contract } from 'starknet';
import { RpcProvider } from 'starknet';
import bigInt from 'big-integer';
import { message } from 'antd';
/**
 *  btc 锁定脚本，用于发布加锁脚本到testnet
 * @param {*} param 
 * @returns 
 */
export async function lockMoneyIntoBTCScript(param) {
    const TESTNET = bitcoin.networks.testnet;
    const ECPair = ecpair.ECPairFactory(ecc);
    // const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs", TESTNET)
    const alice = ECPair.fromWIF(localStorage.getItem('btc_privatekey'), TESTNET)
    const secretHash = param.secretHash;
    const txId = param.tx_id;
    const expiry = param.expiry;
    const value = param.value;
    console.log('param', param);
    const vout = 0;
    // const 
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
    const redeemTx = new bitcoin.Transaction(TESTNET);


    redeemTx.addInput(Buffer.Buffer.from(txId, 'hex').reverse(), vout);
    redeemTx.addOutput(bitcoin.address.toOutputScript(p2shAddress.address, TESTNET)
        , value);
    const hashType = bitcoin.Transaction.SIGHASH_ALL;
    const utxoAddress = bitcoin.payments.p2pkh({ pubkey: alice.publicKey, network: TESTNET });
    const p2pkhScriptPubKey = bitcoin.address.toOutputScript(utxoAddress.address, TESTNET);
    const signatureHash = redeemTx.hashForSignature(0, p2pkhScriptPubKey, hashType);
    //这里以上是正确的
    // const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
    // const unisatSignature = await window.unisat.signMessage(signatureHash.toString('hex'));
    const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
    const scriptSig = bitcoin.script.compile([
        signature,
        alice.publicKey
    ]);
    redeemTx.setInputScript(0, scriptSig);
    console.log(redeemTx.toHex(), 'redeemTx.toHex()');
    return await broadcastTransaction(redeemTx.toHex())
}

/**
 *  btc 解锁脚本，用于解锁BTC到账户
 */

//privateKey, origin_secret, value = 10000, txId,node_btcpublickey
export async function unLockMoneyIntoBTCAccount(param) {
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


    const expiry = 1000;

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
        return {
            tx_id: '',
            code: 300,
            error: error
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
    console.log(data, 'data');
    try {
        const response = await fetch(baseUrl + 'api/v1/makeorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }
        // if (!response.ok) {
        // }
        return response.ok
    } catch (error) {
        console.error('Error:', error);
        return false

    }
}

/**
 * 获取账户utxo
 */
export async function getUTXOList(address) {
    const url = `https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`;
    try {
        const response = await axios.get(url, {
            params: {
                limit: 20,
                unspentOnly: true,
                includeScript: true
            }
        });
        // const tx = response.data.txs;
        // tx.map(item => {
        //     item.outputs.map
        // })
        console.log('utxo', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }

}

//unit: satoshi
export async function findRightUtxo(user_btcaddress, spend_amount, gasFee) {
    try {
        const data = await getUTXOList(user_btcaddress)
        // const price =await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=STRATBTC')
        // console.log(price,'price');
        // const filteredData = data.txs.filter(item => item.inputs && item.inputs[0].addresses[0] === user_btcaddress)
        const txs = data.txs
        // console.log("utxo",txs);
        //每一个tx都是一个可以花费的。找到那个output 的value 作为自己的utxo
        let finded = null
        txs.map(tx => {
            const input = tx.inputs && tx.inputs[0]
            tx.outputs && tx.outputs.map(output => {
                output.addresses && output.addresses.map(address => {
                    if (address == user_btcaddress) {
                        //检查是否是合格的utxo
                        if (output.spent_by) return;
                        console.log(output.value, spend_amount, tx.inputs[0].prev_hash, tx, 'utxo');
                        if (output.value >= (spend_amount + 2 * gasFee)) {
                            // console.log("utxo tx.inpus", tx.inputs[0].prev_hash);
                            console.log('find!', tx.hash);
                            finded = tx.hash
                        }

                    }
                })

            })
        })
        return finded
    } catch (error) {
        return null
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
    let atomic_child_contract = result.events.find(event => event.from_address === starknet_address)?.data[2];
    return atomic_child_contract
}

/**
 * 交易成功，更新订单状态位Succeed
 */
export async function claim_money_succeed(order_id) {
    await axios.post(baseUrl + 'api/v1/orderSucceed', { order_id: order_id })
}
/**
 * 获取交易订单列表
 */
export async function get_order_list(btcAddress, userSTRKAddress) {
    const url = baseUrl + `api/v1/userOrder?user_btcaddress=${btcAddress}&user_strkaddress=${userSTRKAddress}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.reverse()
}

export async function getBTCPrice() {
    const response = await fetch('https://api.coinpaprika.com/v1/tickers/btc-bitcoin');
    const data = await response.json();
    const btcPrice = data.quotes.USD.price;
    console.log('data',btcPrice);
    return btcPrice
}