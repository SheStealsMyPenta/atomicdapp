import * as bitcoin from '../bitcoinjs-lib';
import * as Buffer from '../safe-buffer';
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs"
import * as ecpair from 'ecpair'
import { baseUrl } from '../static/Const';

export async function lockMoneyIntoBTCScript(param) {
    const TESTNET = bitcoin.networks.testnet;
    const ECPair = ecpair.ECPairFactory(ecc);
    const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs", TESTNET)
    const secretHash = bitcoin.crypto.sha256("123");// 
    const txId = "a25aa158739ec8acf59f70ee7318a39a9e9b7e85d78aa4905a0fe4ebd06af6d2";
    const expiry = 1000;
    const value = 1200000;

    const vout = 0;
    // const 
    const lockingScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_IF,
        bitcoin.opcodes.OP_SHA256,
        secretHash,
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(param.bob_address),
        bitcoin.opcodes.OP_ELSE,
        bitcoin.script.number.encode(expiry).toString('hex'),
        bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
        bitcoin.opcodes.OP_DROP,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160(param.alice_address),
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
    const utxoAddress = bitcoin.payments.p2pkh({ pubkey: Buffer.Buffer.from('033e1415a0ddeabfb73d4572902b33465fa83e5db3eb6f38ab91f82eda480e9c44', 'hex'), network: TESTNET });
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
    console.log(redeemTx.toHex());
        // await window.unisat.pushTx({
        //     rawtx: redeemTx.toHex()
        // });

    return "txid"
}


export async function synch_makeorder(param) {
    // const data = {
    //         node_id: selectedCard.nodeid,
    //         swaptype: "strk2btc",
    //         timestamp: "2024-04-17T11:30:00.000Z",
    //         user_btcaddress: btcAddress,
    //         user_strkaddress: strkAddress,
    //         amount_in: 1000,
    //         amount_out: 0.002,
    //         transaction_hash: "transaction_hash_value",
    //         hashlock: "hashlock_value",
    //         node_btcaddress: selectedCard.node_btcaddress,
    //         node_strkaddress: selectedCard.node_strkaddress
    // };

    const data = {
        node_id: param.nodeid,
        swaptype: "btc2strk",
        timestamp: new Date(),
        user_btcaddress: param.btcAddress,
        user_strkaddress: "address_1",
        amount_in: param.amount_in,
        amount_out: param.amount_out,
        transaction_hash: param.tx_id,
        hashlock: param.hash_lock,
        node_btcaddress: param.btcAddress,
        node_strkaddress: param.strkaddress,
    }
    try {
        const response = await fetch(baseUrl + 'api/v1/makeorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('Response:', response);
        const responseData = await response.json();
        console.log('Response:', responseData);
    } catch (error) {
        console.error('Error:', error);
    }
}


export async function getUTXO(address) {
    try {
        const response = await fetch(baseUrl + 'api/v1/getUtxo', {
            method: 'GET',
            headers: {},
        });
        const data = await response.json();
        console.log("data", data);
        return data;
    } catch (error) {
        console.error('Error fetching UTXO:', error);
        throw error;
    }
}

// 示例：获取某个地址的 UTXO
const address = 'your-unisat-wallet-address-here';

