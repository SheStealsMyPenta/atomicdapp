import { CopyOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { Modal } from 'antd';
import { Button, Pagination, Spin } from 'antd/es';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Tabs } from 'antd';
import { WalletContext } from '../../WalletContext';
import { useContract } from "@starknet-react/core";
import { RpcProvider, Contract, uint256 } from 'starknet'
import BigInt from 'big-integer';

import { useAccount, useBalance, useContractRead, useContractWrite, useNetwork } from "@starknet-react/core";
import { Button as notificationButton, notification, Space } from 'antd';
import useAllowanceRead from './starknet-contract-provider';
import bigInt from 'big-integer';
import { findRightUtxo, getBTCPrice, getUTXOList, get_strk_Token_allowance, get_transactionhash_result, lockMoneyIntoBTCScript, synch_makeorder } from '../../Utils/AtomicService';
import { action_swapBtc2Stark, action_swapStark2BTC, baseUrl, factory_contract_address, factory_contract_address_hash, gasFee, satoshi_unit, swapBtc2Stark, swapStark2Btc, token_contract_address } from '../../static/Const';
import * as bitcoin from '../../bitcoinjs-lib';
import btcimg from '../../assets/btc.png'
import strkimg from '../../assets/strk.png'
import * as Buffer from '../../safe-buffer';
import { abi, abi_factory, claimAbi } from '../../static/abi';
import { message } from 'antd';
import { displayCustomString, getRandomNumber, hashToByteArray } from '../../Utils/Common';


export default function Listing() {
    const [callsCreate, setCallsCreate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([])
    const [current, setCurrent] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [buyAmount, setBuyAmount] = useState('0');
    const [swapType, setSwapType] = useState(1) //1 btc->stark
    const [btcPrice, setBtcPrice] = useState(0)
    const [transaction_detial, setTxDetial] = useState({
        secretHash: '',
        recepient: '',
        transaction_hash: ''
    })
    const [selectedCard, setSelectedCard] = useState({
        title: 'BTC',
        code: 1,
        price: 1,
        ps: 1,
        remaining: 1,
        fee: 1,
        Total: 1,
        Value: 1,
        server: 1,
        balanceof_btc: 1,
        node_btc_publickey: ''
    })
    const {
        btcAddress,
        strkAddress,
        setStrkAddress,
        setBtcAddress,
        setStrkAddressIsDropdownOpen,
        setBtcAddressIsDropdownOpen,

        isStrkAddressDropdownOpen,
        isBtcAddressDropdownOpen,
        setSwapContractAddress,
        handleStarknetClick,
        CloseConnectStarknet,
        handleBitcoinClick
    } = useContext(WalletContext);
    const [api, contextHolder] = notification.useNotification();
    const openNotificationWithIcon = (type) => {
        api[type]({
            message: 'Notification Title',
            description:
                'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
            placement: 'bottomLeft', // 设置通知位置为屏幕左下角
            duration: 1.5, // 设置通知持续时间为 3 秒
            style: {
                // backgroundColor: '#262626', // 设置通知背景颜色为黑色
                // color: '#fff', // 设置通知文本颜色为白色
            },
        });
    };

    const testAddress = token_contract_address


    const { address } = useAccount();
    const { contract: strk_contract } = useContract({
        abi: abi,
        address: token_contract_address,  //strk contract address;
    });
    const { contract: atomic_factory_contract } = useContract({
        abi: abi_factory,
        address: factory_contract_address,  //strk contract address;
    });
    // console.log('atomic_factory_contract',atomic_factory_contract);

    const { data, isError, balance_isLoading, error } = useContractRead({
        functionName: "balance_of",
        args: [strkAddress],
        abi,
        address: token_contract_address,
        watch: true,
    });

    const { approve_data, approve_isError, approve_isLoading, approve_error } = useContractRead({
        functionName: "allowance",
        args: ['0x03c096e020443492c5cFa99106e9fe343a8E579fbB49Ad181AaC7f244Dd4337F', '0x02177a3a2ce3daaf21f65c8df1b031f6d69d292b92354ce842180e098349911f'],
        abi,
        address: testAddress,
        watch: true,
    });

    //approve contract of strk
    // let calls = [];
    var calls_approve = useMemo(() => {
        if (!address || !strk_contract) return [];
        return strk_contract.populateTransaction["approve"](factory_contract_address, { low: 999 * BigInt(1000000000000000000), high: 0 });
    }, [strk_contract, address]);
    const {
        writeAsync,
        approved_data,
        isPending,
    } = useContractWrite({
        calls: calls_approve,
    });


    //invoke create funcion
    const createCalls = useMemo(() => {
        return (spend_address, receivce_address, buyAmount, hash_secret) => {
            if (!address || !atomic_factory_contract) return [];
            const hash_lock_array = hashToByteArray(hash_secret)
            console.log("spend_address", spend_address);
            console.log("receivce_address", receivce_address);
            console.log("buyAmount", buyAmount);
            console.log("hash_secret", hash_secret);
            console.log("hash_lock_arra", hash_lock_array);
            // // 假设 hashValues 是一个包含了 32 个元素的数组
            // for (let i = 0; i < 32; i++) {
            //   hash_lock[`hash_${i + 1}`] = hash_lock_array[i];
            // }
            // console.log("hashLock",hash_lock);
            return atomic_factory_contract.populateTransaction["create"](
                factory_contract_address_hash,
                spend_address,
                receivce_address,
                token_contract_address,
                Math.floor(Math.random() * (100000 - 10000 + 1)) + 10000,
                bigInt(buyAmount) * bigInt(1000000000000000000),
                ...hash_lock_array
            );
        };
    })

    // const calls_create = useMemo(() => {
    //     if (!address || !atomic_factory_contract) return [];
    //     // console.log('开始调用合约')
    //     // 移除非空断言操作符 !
    //     return atomic_factory_contract.populateTransaction["create"](
    //         factory_contract_address_hash,
    //         '0x02221B06403918b23F2DD1717D8Ef346fFc85C069efE7FBF680c21A5bDfE5715',
    //         '0x02221B06403918b23F2DD1717D8Ef346fFc85C069efE7FBF680c21A5bDfE5715',
    //         token_contract_address,
    //         10000,
    //         buyAmount * bigInt(1000000000000000000),
    //         0xa7,
    //         0x3f,
    //         0xcf,
    //         0x33,
    //         0x96,
    //         0x40,
    //         0x92,
    //         0x92,
    //         0x07,
    //         0x28,
    //         0x1f,
    //         0xb8,
    //         0xe0,
    //         0x38,
    //         0x88,
    //         0x48,
    //         0x06,
    //         0xe2,
    //         0xeb,
    //         0x08,
    //         0x40,
    //         0xf2,
    //         0x24,
    //         0x56,
    //         0x94,
    //         0xdb,
    //         0xba,
    //         0x1d,
    //         0x5c,
    //         0xc8,
    //         0x9e,
    //         0x65);
    // }, [atomic_factory_contract, address]);

    const {
        writeAsync: writeCreate,
        // Create_data,
        // Create_isPending,
    } = useContractWrite({
        calls: callsCreate,
    });

    const { TabPane } = Tabs;

    const handleInputChange = (e) => {
        // 更新buyAmount状态
        setBuyAmount(e.target.value);
    };

    const handleMax = (e) => {
        // 更新buyAmount状态
        setBuyAmount((BigInt(data) / BigInt(1000000000000000000)));

    };

    const showModal = () => {

        //增加判断是否已经连接上了两个钱包，如果其中一个没连接上，直接
        if (!btcAddress || btcAddress === '') {
            handleBitcoinClick();
            return;
        }
        if (!address || address === '') {
            handleStarknetClick();
            return
        }
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const swaptBitcoin2Stark = async () => {
        const origin_secret = getRandomNumber();
        const secret = Buffer.Buffer.from('123', 'utf-8');
        const secretHash = bitcoin.crypto.sha256(secret);// 
        const tx_id = await findRightUtxo(btcAddress, buyAmount * satoshi_unit, gasFee);
        if (!tx_id) {
            message.error('utxo not find,tx cancel!')
            return
        }
        const param = {
            bob_address: selectedCard.bitcoin_address, //接收地址为node端池子的btc地址
            secretHash: secretHash,//原象hash
            expire: 1000,
            value: buyAmount * satoshi_unit + gasFee,
            tx_id: tx_id,
            node_btcpublickey: selectedCard.node_btc_publickey
        }
        // // localStorage.setItem('origin_secret', origin_secret)
        // try {
        const broadcastTxRes = await lockMoneyIntoBTCScript(param);
        // console.log("broadcastTxRes",broadcastTxRes);
        // if (broadcastTxRes&&broadcastTxRes.code == 300) {
        //     message.error("order failed!", broadcastTxRes.error)
        //     return;
        // }
        // const broadcastTxRes = {
        //     tx_id: 'ae3e2ca9dcb3b777a01ba70165490f514e6b8c6531f6f1ecabba3f6cf1a899d7'
        // }
        // console.log('selected', selectedCard);
        // message.success("tx succeed" + "b784f0cf0adced5d0679ef5d195b941498fc78ef65cd10efe9fd2e685bc7a311")
        const makeorderParam = {
            nodeid: selectedCard.nodeid,
            swaptype: action_swapBtc2Stark,
            btcAddress: btcAddress,
            strkAddress: address,
            amount_in: buyAmount,
            amount_out: buyAmount * selectedCard.raw_data.price,
            transaction_hash: broadcastTxRes.tx_id,
            hashlock: param.secretHash.toString('hex'),
            node_btcaddress: selectedCard.bitcoin_address,
            node_strkaddress: selectedCard.starknet_address,
            node_btc_publickey: selectedCard.node_btc_publickey,
            user_btc_publickey: window.unisat && await window.unisat.getPublicKey()
        }

        const result = await synch_makeorder(makeorderParam);
        if (result) {
            message.success({
                content: "order createed! please go to order to check process", result,
                duration: 5, // 设置消息显示时间为10秒
            });
        } else {
            message.error({
                content: "order failed",
                duration: 5, // 设置消息显示时间为10秒
            });
        }

        // } catch (error) {
        //     message.error("order failed!")
        // }



        // console.log("result");
        //判断广播是否成功

        // if (broadcastTxRes.code == 200) {
        //     const makeorderParam = {
        //         nodeid: selectedCard.nodeid,
        //         swaptype: action_swapBtc2Stark,
        //         btcAddress: btcAddress,
        //         amount_in: -1,
        //         amount_out: -1,
        //         transaction_hash: broadcastTxRes.tx_id,
        //         hashlock: param.secretHash,
        //         node_btcaddress: selectedCard.bitcoin_address,
        //         node_strkaddress: selectedCard.starknet_address,
        //     }
        //     await synch_makeorder(makeorderParam);
        // }
    }
    const swapStark2Bitcoin = async () => {
        const origin_secret = getRandomNumber();
        const secret = Buffer.Buffer.from("123", 'utf-8');
        const secretHash = bitcoin.crypto.sha256(secret);// 
        setTxDetial({
            secretHash: secretHash.toString('hex'),
        })
        const calls_create = createCalls(address, selectedCard.starknet_address, buyAmount, secretHash.toString('hex'));
        const allowance = await get_strk_Token_allowance(address)
        console.log("allowance", allowance);
        // if (allowance < buyAmount) {
        // await writeAsync()
        // }
        // if()
        setCallsCreate(calls_create)
    }
    useEffect(() => {
        const executeTransaction = async () => {
            if (callsCreate) {
                try {
                    let new_contract = await writeCreate();
                    // console.log("new_contr",new_contract);
                    // let new_contract={
                    //     transaction_hash:'0x6116da15d2511c24934b0c3b1cead51ac0e40d0b5acdc69094dfa1bd1da3250'
                    // }
                    let atomic_child_contract_address = await get_transactionhash_result(new_contract['transaction_hash'], address);
                    if (!atomic_child_contract_address) throw 'did not create new contract '
                    // 获取到新的合约地址后进行订单生成
                    const makeorderParam = {
                        nodeid: selectedCard.nodeid,
                        swaptype: action_swapStark2BTC,
                        btcAddress: btcAddress,
                        strkAddress: address,
                        amount_in: buyAmount,
                        amount_out: buyAmount,
                        transaction_hash: atomic_child_contract_address,
                        hashlock: transaction_detial.secretHash,
                        node_btcaddress: selectedCard.bitcoin_address,
                        node_strkaddress: selectedCard.starknet_address,
                        node_btc_publickey: selectedCard.node_btc_publickey,
                        user_btc_publickey: window.unisat && await window.unisat.getPublicKey()
                    };
                    const result = await synch_makeorder(makeorderParam);
                    message.success({
                        content: `Order created! Please go to order to check process. Address: ${atomic_child_contract_address}`,
                        duration: 5, // 设置消息显示时间为10秒
                    });
                } catch (error) {
                    console.error('Transaction failed:', error);
                    message.error("Transaction failed!");
                }
            }
        };

        executeTransaction();
    }, [callsCreate]);

    const HandleSwap = async () => {
        setIsLoading(true);
        if (swapType == swapBtc2Stark) {
            swaptBitcoin2Stark();
        } else {
            swapStark2Bitcoin()
        }
        setIsLoading(false)
        handleOk()
        // if(current==1){
        //     swapStark2Bitcoin()
        // }

        // const makeorderParam = {
        //     nodeid: selectedCard.nodeid,
        //     swaptype: "btc2strk",
        //     btcAddress: btcAddress,
        //     amount_in: -1,
        //     amount_out: -1,
        //     transaction_hash: tx_id,
        //     hashlock: param.hash_lock,
        //     node_btcaddress: param.btcAddress,
        //     node_strkaddress: param.strkaddress,
        // }

        // try {
        //     //获取当前地址余额
        //     if (address == '') {
        //         console.log('未连接钱包', strkAddress);
        //         openNotificationWithIcon('error');

        //     } else {
        // let approved_amount = await get_strk_Token_allowance(strkAddress);

        //         if (approved_amount >= buyAmount) {

        //             // console.log('额度足，无需授权');

        // let new_contract = await writeCreate();

        // console.log('new_contract', new_contract);

        // let atomic_child_contract_address = await get_transactionhash_result(new_contract['transaction_hash']);
        // let atomic_child_contract_address = await get_transactionhash_result('0x22fdf943a12643709fc931a4be4d96524d6c483944590f5942af63376002542')

        // setSwapContractAddress(atomic_child_contract_address)

        //         } else {
        //             // let ruslt = await writeAsync();
        //             // // // 这里执行交易代码

        //             // console.log('交易状态为', ruslt);


        // let new_contract = await writeCreate();
        //             // console.log('new_contract', new_contract);

        //             // let atomic_child_contract_address = await get_transactionhash_result(new_contract['transaction_hash']);
        //             // console.log('atomic_child_contract_address', atomic_child_contract_address);

        //         }

        //         openNotificationWithIcon('success');
        //         setIsModalOpen(false);
        //         console.log('开始订单信息到节点');

        //         //同步信息给relay   
        //         // await synch_makeorder();
        //         console.log('已经同步订单信息到节点');





        //     }



        // } catch (error) {
        //     console.error(error);
        //     // 处理错误
        // } finally {
        //     setIsLoading(false); // 无论成功或失败,都设置加载状态为 false
        // }

    };
    //tab 切换 交易模式，1：BTC->STARK 2：STARK -> BTC
    const onChange = (key) => {
        setSwapType(key)
    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                // 45.32.100.53
                const response = await fetch(baseUrl + 'api/v1/pool');
                const data = await response.json();
                const formattedList = data.pool.map((item) => ({
                    title: 'BTC',
                    code: `#${item.nodeid}`,
                    price: `1 BTC = ${item.price} STRK`,
                    ps: `≈$${(item.price * 0.0819).toFixed(4)}`,
                    remaining: `${item.blanceof_btc} BTC`,
                    fee: `${item.fee}%`,
                    Total: `${item.supply_btc} BTC`,
                    Value: `≈$${(item.supply_btc * item.price * 0.0819).toFixed(4)}`,
                    server: item.bitcoin_address,
                    bitcoin_address: item.bitcoin_address,
                    balanceof_btc: item.balanceof_btc,
                    starknet_address: item.starknet_address,
                    nodeid: item.nodeid,
                    blanceof_strk: item.blanceof_strk,
                    node_btc_publickey: item.node_btc_publickey,
                    raw_data: item
                }));
                setList(formattedList);
            } catch (error) {
                console.error('Error fetching pool data:', error);
            }
        };

        fetchData();
        getBTCPrice().then(res=>{
            setBtcPrice(res);
        })
    
    }, []);
    return (
        <div className='listing'>
            <div className='ltop ss'>
                <div className='l'>

                    <Tabs defaultActiveKey={swapBtc2Stark} onChange={onChange} >
                        <TabPane tab={<Button type="link">BTC2Strk</Button>} key={swapBtc2Stark}>
                            <div className="tab-pane-container">
                                <div className='lbot'>
                                    {list.map((e, i) => {
                                        return (
                                            <div key={i} className={current === i ? 'lbox cur' : 'lbox'} onClick={() => {
                                                setCurrent(i);
                                    
                                                setSelectedCard(e);
                                            }}>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <h3 style={{ fontSize: '20px' }}>{e.title}</h3>
                                                    <span style={{ padding: '1px 6px', borderRadius: '4px', background: "rgba(255, 255, 255, 0.15)" }}>{e.code}</span>
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <span className='ds'>Price</span>
                                                    <div className='s'>
                                                        <span style={{ color: "#00D889" }}>{e.price}</span>
                                                        <span style={{ color: "#8B8B8B" }}>{e.ps}</span>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span className='ds'>Remaining</span>
                                                    <span>{e.remaining}</span>
                                                </div>
                                                <div style={{ marginBottom: '11px' }}>
                                                    <h3>fee</h3>
                                                    <span>{e.fee}</span>
                                                </div>
                                                <div style={{ marginBottom: '13px' }}>
                                                    <span className='ds'>Total Value</span>
                                                    <div className='s'>
                                                        <span>{e.Total}</span>
                                                        <span style={{ color: '#8B8B8B' }}>{e.Value}</span>
                                                    </div>
                                                </div>
                                                <div className='lbs'>
                                                    <div className='lser'>
                                                        <span>Server</span>
                                                        <div className='lrsA'>
                                                            <span style={{ color: '#8B8B8B' }}>{e.server.slice(0, 6) + '..' + e.server.slice(-4)}</span>
                                                            <CopyOutlined style={{ color: '#00D889', cursor: "pointer" }} />
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => [showModal()]} className='bts' ghost>Swap BTC to Strk</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                                <div className='fen'>
                                    <Pagination rootClassName="fens" style={{ color: '#fff' }} total={list.length} />
                                </div></div>

                        </TabPane>

                        <TabPane tab={<Button type="link">Strk2BTC</Button>} key={swapStark2Btc}>
                            <div className="tab-pane-container">
                                <div className='lbot'>
                                    {list.map((e, i) => {
                                        return (
                                            <div key={i} className={current === i ? 'lbox cur' : 'lbox'} onClick={() => {
                                                setCurrent(i);

                                                setSelectedCard(e);
                                            }}>
                                                <div style={{ marginBottom: '15px' }}>
                                                    <h3 style={{ fontSize: '20px' }}>{e.title}</h3>
                                                    <span style={{ padding: '1px 6px', borderRadius: '4px', background: "rgba(255, 255, 255, 0.15)" }}>{e.code}</span>
                                                </div>
                                                <div style={{ marginBottom: '4px' }}>
                                                    <span className='ds'>Price</span>
                                                    <div className='s'>
                                                        <span style={{ color: "#00D889" }}>{e.price}</span>
                                                        <span style={{ color: "#8B8B8B" }}>{e.ps}</span>
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '12px' }}>
                                                    <span className='ds'>Remaining</span>
                                                    <span>{e.remaining}</span>
                                                </div>
                                                <div style={{ marginBottom: '11px' }}>
                                                    <h3>fee</h3>
                                                    <span>{e.fee}</span>
                                                </div>
                                                <div style={{ marginBottom: '13px' }}>
                                                    <span className='ds'>Total Value</span>
                                                    <div className='s'>
                                                        <span>{e.Total}</span>
                                                        <span style={{ color: '#8B8B8B' }}>{e.Value}</span>
                                                    </div>
                                                </div>
                                                <div className='lbs'>
                                                    <div className='lser'>
                                                        <span>Server</span>
                                                        <div className='lrsA'>
                                                            <span style={{ color: '#8B8B8B' }}>{e.server.slice(0, 6) + '..' + e.server.slice(-4)}</span>
                                                            <CopyOutlined style={{ color: '#00D889', cursor: "pointer" }} />
                                                        </div>
                                                    </div>
                                                    <Button onClick={() => [showModal()]} className='bts' ghost>Swap Strk to Btc</Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>


                                <div className='fen'>
                                    <Pagination rootClassName="fens" style={{ color: '#fff' }} total={list.length} />
                                </div></div>
                        </TabPane>
                    </Tabs>

                </div>
                <div className='r'>
                    <Button type="link">
                        Make a pool
                    </Button>
                </div>
            </div>

            {
                selectedCard.raw_data ? (<Modal footer={null} centered title={swapType == 1 ? 'Swap BTC to Strk' : 'Swap Strk to BTC'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    <div className='Mod'>
                        <div className="modelBox">
                            <span>Server</span>
                            <span className="asA">{selectedCard.server}</span>
                        </div>
                        <div className="modelBox">
                            <span>Price</span>
                            <span className="asA" style={{ color: "#00D889" }}>
                                {selectedCard.price}
                            </span>
                        </div>
                        <div className='modelBox'>
                            <span style={{ display: 'flex', alignItems: 'center' }}>Input Amount  <img src={swapType == 1 ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} /></span>
                            <span className='asA'> <Input value={buyAmount} onChange={handleInputChange} /> <a onClick={handleMax} style={{ color: "#00D889" }}  > max </a></span>
                        </div>
                        <div className='modelBox'>
                            <span style={{ display: 'flex', alignItems: 'center' }}>Spend Amount  <img src={swapType == 1 ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} /></span>
                            <span className='asA'> {swapType == 1 ? (Number(buyAmount) + ((2 * gasFee) / satoshi_unit)).toFixed(8) : buyAmount}</span>

                        </div>
                        {
                            swapType == 1 ? <div className='modelBox'>
                                <span style={{ display: 'flex', alignItems: 'center' }}>Gas Fee  <img src={swapType == 1 ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} /></span>
                                <span className='asA'>{2 * gasFee / satoshi_unit} </span>
                                {/* <span>{swapType == 1 ? '(gas fee+spend amount + service fee)' : ''}</span> */}
                            </div> : <></>
                        }

                        <div className='modelBox'>
                            <span style={{ display: 'flex', alignItems: 'center' }}>Receive Amount  <img src={swapType == 1 ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} /></span>

                            <span className='asA' style={{ color: "#00D889" }}>   {swapType == 1 ? buyAmount * selectedCard.raw_data.price : buyAmount / selectedCard.raw_data.price}</span>
                        </div>
                        <div className='modelBox'>
                            <span>Receive Amount </span>
                            <span className='asA' style={{ color: "#00D889" }}>   {'≈$ ' + btcPrice*buyAmount}</span>
                        </div>
                        <div className='modelBox'>
                            <span>Total Value</span>
                            <span className='asA' style={{ color: "#00D889" }}>   {selectedCard.Value}</span>
                        </div>
                        <div className='modelBox'>
                            <span>Service Fee</span>
                            <span className='asA'> {selectedCard.raw_data.fee * buyAmount} {swapType == 1 ? "btc" : 'strk'}</span>
                        </div>
                        <div className='modelBox'>
                            <span className='btnsAA asA' style={{ fontSize: '15px', color: "#00D889" }}>warnlng: please cllam your token on 48 hours,If you  no’t you will perhaps lost your token </span>
                        </div>
                        <div className='modelBox sa'>
                            {contextHolder}
                            <Button
                                className='bts'
                                ghost
                                onClick={HandleSwap}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spin /> : 'Swap'}
                            </Button>
                        </div>
                    </div>
                </Modal>) : <></>
            }







        </div >
    )
}



