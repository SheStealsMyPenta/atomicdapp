import { disconnect as disconnectStarknetkit ,useStarknetkitConnectModal} from "starknetkit";
import React, { createContext, useState } from 'react';
import { RpcProvider, Contract } from 'starknet'
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import * as bitcoin from './bitcoinjs-lib';
import * as Buffer from './safe-buffer';
import { InjectedConnector } from "starknetkit/injected"
import { gasFee } from "./static/Const";



export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {

    const [strkAddress, setStrkAddress] = useState('');
    const [btcAddress, setBtcAddress] = React.useState('');
    const [isStrkAddressDropdownOpen, setStrkAddressIsDropdownOpen] = useState(false);
    const [isBtcAddressDropdownOpen, setBtcAddressIsDropdownOpen] = useState(false);
    const [btcPrivateKey, setBtcPrivateKey] = useState('')
    const [btcPublicKey,setBtcPublicKey] = useState('')
    const [swapContractAddress,setSwapContractAddress]= useState('0x0093b7bc84022d164d022fecd24a54a05a10c232db0d029d421fa3b9fa3fc786')
    const [userOrderList, setUserOrderList] = useState([])
    const [btcGasFee, setBtcGasFee ] = useState(gasFee)
    const {connect } = useConnect();
    const connectors = [
        new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
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
        console.log('!!!!!!!!!');
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
        setBtcPublicKey(getPublicKey)
        console.log('getPublicKey', getPublicKey)
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
        btcPublicKey,
        btcGasFee,
        setBtcGasFee,
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