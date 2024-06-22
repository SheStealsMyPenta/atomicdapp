const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');
const ecpair = require('ecpair');


const TESTNET = bitcoin.networks.testnet;
const ECPair = ecpair.ECPairFactory(ecc);

function claimBtc(privateKey, origin_secret, value = 10000, txId) {
    const alice = ECPair.fromWIF(
        privateKey, TESTNET
    );

    const address = bitcoin.payments.p2pkh({
        pubkey: alice.publicKey,
        network: TESTNET,
    });

    // const txId = "b784f0cf0adced5d0679ef5d195b941498fc78ef65cd10efe9fd2e685bc7a311";
    // const txId='f1add27c565fbc58035af61bb027227b7607ab1258cbc5b3eb1594199b2b1de0'
    const vout = 0;
    // const value = 10000; 


    // const secret = "123"; 

    // const secretHash = bitcoin.crypto.sha256("123");// 

    const secret = Buffer.from(origin_secret, 'utf-8');

    const secretHash = bitcoin.crypto.sha256(secret);// 

    console.log("secretHash", secretHash.toString('hex'))
    console.log("alice address", address.address)


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

    redeemTx.addInput(Buffer.from(txId, 'hex').reverse(), vout);
  
    redeemTx.addOutput(bitcoin.address.toOutputScript(address.address, TESTNET), value);




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
    // console.log('Redeem Tx Hex:', redeemTx.toHex());
    return redeemTx.toHex();
}

module.exports ={
    claimBtc
}