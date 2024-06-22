import { disconnect as disconnectStarknetkit ,useStarknetkitConnectModal} from "starknetkit";
import React, { createContext, useState } from 'react';
import { RpcProvider, Contract } from 'starknet'
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import * as bitcoin from './bitcoinjs-lib';
import * as Buffer from './safe-buffer';
import { InjectedConnector } from "starknetkit/injected"



export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {

    const [strkAddress, setStrkAddress] = useState('');
    const [btcAddress, setBtcAddress] = React.useState('');
    const [isStrkAddressDropdownOpen, setStrkAddressIsDropdownOpen] = useState(false);
    const [isBtcAddressDropdownOpen, setBtcAddressIsDropdownOpen] = useState(false);
    const [btcPrivateKey, setBtcPrivateKey] = useState('')
    const [swapContractAddress,setSwapContractAddress]= useState('0x0093b7bc84022d164d022fecd24a54a05a10c232db0d029d421fa3b9fa3fc786')
    const [userOrderList, setUserOrderList] = useState([])
    const {connect } = useConnect();
    const connectors = [
        new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
        new InjectedConnector({ options: { id: "braavos", name: "Braavos" } })
    ]

    const { account, address, status } = useAccount();
    const ConnectWallet = async () => {
        const { starknetkitConnectModal } = useStarknetkitConnectModal({
            connectors: connectors,
            dappName: "ERC20 UI",
            modalTheme: "system"

        })
        const { connector } = await starknetkitConnectModal()
        await connect({ connector })
        
    
        // console.log('account ', account);
        // console.log('connector ', connector.wallet.account.address);

        // return connector
        // console.log('account ', account);
        // console.log('connector ', connectors.wallet.account.address);
        // const { wallet } = await connectStarknetkit({
        //     connectors: [
        //         new InjectedConnector({
        //             options: { id: "argentX" }
        //         }),
        //         new InjectedConnector({
        //             options: { id: "braavos" }
        //         })
        //     ]
        // })
        // return connector
    }


    const handleStarknetClick = async () => {
        try {
            if (address === undefined || address === '') {
               
                const wallet = await ConnectWallet();
      
                // setStrkAddress(address);
                setStrkAddressIsDropdownOpen(false);

            } else {

                setStrkAddressIsDropdownOpen(true);
            }



            // setStrkAddress(connector.wallet.selectedAddress);
            // setStrkAddressIsDropdownOpen(true);


        } catch {
            console.log('no choice wallet');
        }
    };

    const CloseConnectStarknet = async () => {
        if (status === "disconnected") {
            console.log("account", account)
        }
        console.log("account", account)
        await disconnectStarknetkit({ clearLastWallet: true });
        setStrkAddress('');
        setStrkAddressIsDropdownOpen(false);
    };

    const handleBitcoinClick = async () => {
        await connect_bitcoin_net();
        setBtcAddressIsDropdownOpen(true);
    };

    async function connect_bitcoin_net() {

        if (typeof window.unisat !== 'undefined') {
            console.log('UniSat Wallet is installed!');
        }


        let accounts = await window.unisat.requestAccounts();
        console.log('connect success', accounts);

        let account = await window.unisat.getAccounts();
        console.log('connect success', account);

        setBtcAddress(String(accounts));

        let getNetwork = await window.unisat.getNetwork();
        console.log('btc network', getNetwork)


        let getPublicKey = await window.unisat.getPublicKey();
        console.log('getPublicKey', getPublicKey)
        // console.log('getPublickey buffer', Buffer.Buffer.from('032cf9dd2b7cf826a8d0e176ae0127e1e32b7e33dc55d78754c5f60bfd8f1173b8', 'hex'))

        // let getBalance = await window.unisat.getBalance();
        // console.log('btc balance', getBalance)

        const TESTNET = bitcoin.networks.testnet;
        console.log(' currently bitcoin is', TESTNET);


        const txId = "13999c8231ae35952299873ad0093fd0c2efcf6bd07536e14ac61fbfd3235032";
        const vout = 0;
        const value = 0.0024;


        const secret = Buffer.Buffer.from('123', 'utf-8');

        const secretHash = bitcoin.crypto.sha256(secret);// 

        console.log('secretHash', secretHash);

        const lockingScript = bitcoin.script.compile([
            bitcoin.opcodes.OP_IF,
            bitcoin.opcodes.OP_SHA256,

            bitcoin.opcodes.OP_ENDIF,
            bitcoin.opcodes.OP_EQUALVERIFY,
            bitcoin.opcodes.OP_CHECKSIG
        ]);

        // // sign by ecdsa
        // try {
            // let unisatSign = window.unisat.signMessage('a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', "bip322-simple");
        //     // console.log("unisatSign", unisatSign);
        //     let res = await window.unisat.signPsbt(
        //         '70736274ff010055010000000110acfe52a4d37ba30cd8365621e7ebd0c20ae9d1f762bdbd55045337c7b2f3d20000000000ffffffff01a00f0000000000001976a914b163d850125f1b65eadbcf15f88b7ef16836c1ee88ac00000000000100e002000000012a55fde4d20ca9398904599cbbbd18de439f805504dc6a0a2b9e0cb8e676b131010000006b483045022100cef8d2f151531840c7154f971270bf621bb5689fdc4a126e1d6e7744cd214409022055f2d4cb7de081335fb6c315fb57768b1fee4f0131d3cd6430c69b87c8b1ac970121032cf9dd2b7cf826a8d0e176ae0127e1e32b7e33dc55d78754c5f60bfd8f1173b8ffffffff02983a00000000000017a914d20cde47c6c181596b04c0a1d2a5a86c9b2c8cbe87ee653001000000001976a914b163d850125f1b65eadbcf15f88b7ef16836c1ee88ac0000000001045963a820a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae38876a914b163d850125f1b65eadbcf15f88b7ef16836c1ee6700b27576a914b163d850125f1b65eadbcf15f88b7ef16836c1ee6888ac0000',
        //         {
        //             autoFinalized:false,
        //             toSignInputs:[
        //               {
        //                 index: 0,
        //                 address: "mwguWMjTcJguvFiBkaAKQ7gEvj72TE4msB",
        //               }

        //             ]
        //         }
        //     )
        //     console.log('unisat sign psbt',res)
        // } catch (e) {
        //     console.log(e);
        // }

        // const signature = bitcoin.script.signature.encode(alice.sign(signatureHash), hashType);
        // const result = await window.okxwallet.bitcoinTestnet.connect()
        // const signStr = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
        // const okx_sign = await window.okxwallet.bitcoinTestnet.signMessage(signStr, 'ecdsa')
        // console.log('okx_sign',okx_sign);







    }

    function setContextBtcPrivateKey(privateKey) {
        setBtcPrivateKey(privateKey)
        console.log("btcPrivate", privateKey);
    }




    const value = {
        btcAddress,
        strkAddress,
        setStrkAddress,
        setBtcAddress,
        address,
        userOrderList,
        btcPrivateKey,
        setStrkAddressIsDropdownOpen,
        setBtcAddressIsDropdownOpen,
        setSwapContractAddress,
        isStrkAddressDropdownOpen,
        isBtcAddressDropdownOpen,
        setUserOrderList,
        handleStarknetClick,
        CloseConnectStarknet,
        setContextBtcPrivateKey,
        handleBitcoinClick,
        swapContractAddress,

    };

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};