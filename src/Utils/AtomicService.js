import * as bitcoin from '../bitcoinjs-lib';
import * as Buffer from '../safe-buffer';
import * as ecc from "tiny-secp256k1"
import { ECPair} from 'ecpair';
export async function lockMoneyIntoBTCScript(param) {
    // const ECPair = ecpair.ECPairFactory(ecc);
    // const alice = ECPair.fromWIF("cN6RMJjZTHbaU7Ci4C9sQNughWZZjSwPZgyWTuhFrA8pJy4c5tHs",TESTNET)
    const secretHash = "123";
    const txId = "eec70df1224b7d5e797bea269ed58a76cb08bf0b67e0481fb4cf3691424e0349";
    const expiry = 1000;
    const value = 500000;
    const TESTNET = bitcoin.networks.testnet;
    const vout = 0;
    // const 
    const lockingScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_IF,
        bitcoin.opcodes.OP_SHA256,
        secretHash,
        bitcoin.opcodes.OP_EQUALVERIFY,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160("bob.publicKey"),
        bitcoin.opcodes.OP_ELSE,
        bitcoin.script.number.encode(expiry).toString('hex'),
        bitcoin.opcodes.OP_CHECKSEQUENCEVERIFY,
        bitcoin.opcodes.OP_DROP,
        bitcoin.opcodes.OP_DUP,
        bitcoin.opcodes.OP_HASH160,
        bitcoin.crypto.hash160("alice.publicKey"),
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
    // "0x68a0e1a7380b3309b10abc72a86a4530cc3e2e215b6824840265d340025c879"
    const utxoAddress = bitcoin.payments.p2pkh({ pubkey: Buffer.Buffer.from('033e1415a0ddeabfb73d4572902b33465fa83e5db3eb6f38ab91f82eda480e9c44', 'hex'), network: TESTNET });
    const p2pkhScriptPubKey = bitcoin.address.toOutputScript(utxoAddress.address, TESTNET);

    
    const signatureHash = redeemTx.hashForSignature(0, p2pkhScriptPubKey, hashType);

    //这里以上是正确的

    // const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
    // const unisatSignature = await window.unisat.signMessage(signatureHash.toString('hex'));
    
    // const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);

    const scriptSig = bitcoin.script.compile([
        // signature,
        '033e1415a0ddeabfb73d4572902b33465fa83e5db3eb6f38ab91f82eda480e9c44'
    ]);
    redeemTx.setInputScript(0, scriptSig);
    console.log("scriptSig", scriptSig.toString('hex'))

}