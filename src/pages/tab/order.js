import { DownOutlined, UserOutlined, CopyOutlined, SyncOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { Dropdown, Table, Button, Spin, Empty, Tag, notification, } from 'antd';
import { Space } from 'antd';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { action_swapBtc2Stark, action_swapStark2BTC, baseUrl, data_mount, gasFee, minGasFee, satoshi_unit, swapBtc2Stark, swapStark2Btc, token_contract_address } from '../../static/Const';
import { WalletContext } from '../../WalletContext';
import { useAccount, useContract, useContractWrite, useWaitForTransaction } from '@starknet-react/core';

import { claim_money_succeed, getBtcAcc, getBtcGasFee, get_order_list, get_transactionhash_result, unLockMoneyIntoBTCAccount, unLockMoneyIntoBTCAccount_withdraw, unLockMoneyIntoBTCScript, updateNodeListIncreaseTvl, withdraw_money_succeed } from '../../Utils/AtomicService';
import { message } from 'antd';
import { abi, claimAbi } from '../../static/abi';
import { convertToAsciiHex, displayCustomString } from '../../Utils/Common';

import btcimg from '../../assets/btc.png'
import strkimg from '../../assets/strk.png'
import * as Buffer from '../../safe-buffer';
import { Modal } from 'antd';
import { Input } from 'antd';
export default function Order() {
  const [loading, setLoading] = useState(true);
  const [claim_contract_address, setClaimContractAddress] = useState(null)
  const [withdraw_contract_address, setWithdrawContractAddress] = useState(null)
  const [order, setOrder] = useState(null)
  const { address } = useAccount();
  const [modalVisible, setModalVisible] = useState(false)
  const [screenWidth, setSreenWidth] = React.useState(window.innerWidth);
  const {
    btcAddress,
    userOrderList,
    setUserOrderList,
    btcPublicKey,
    btcGasFee,
    handleBitcoinClick,
    handleStarknetClick,
    setBtcGasFee
  } = useContext(WalletContext);
  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, title = 'test', duration = 30, closable = true) => {
    const notificationKey = `open${Date.now()}`; // 生成唯一的 key
    const notificationObj = api[type]({
      message: title,
      description:
        'please wait tx succeed!',
      placement: 'bottomLeft', // 设置通知位置为屏幕左下角
      duration: duration, // 设置通知持续时间为 3 秒
      key: notificationKey, // 设置唯一 key
      style: {
        // backgroundColor: '#262626', // 设置通知背景颜色为黑色
        // color: '#fff', // 设置通知文本颜色为白色
      },
      icon: <Spin />, // 使用 Spin 组件作为加载图标
      closable: closable, // 设置为 false，用户无法手动关闭通知
    });
    return notificationKey

  };
  const { contract: strk_contract } = useContract({
    abi: abi,
    address: token_contract_address,  //strk contract address;
  });
  const { contract: claimContract } = useContract({
    abi: claimAbi,
    address: claim_contract_address
  })
  const { contract: withdrawContract } = useContract({
    abi: claimAbi,
    address: withdraw_contract_address
  })
  const calls_claim = useMemo(() => {
    try {
      if (!address) return [];
      if (claim_contract_address === "") return;
      // const origin_secret = localStorage.getItem('origin_secret');
      // const origin_secret = '123';
      // console.log("convertToAsciiHex(localStorage.getItem('origin_secret'))", convertToAsciiHex(origin_secret));
      // const secret = Buffer.Buffer.from(origin_secret.toString(), 'utf-8');
      // const secretHash = bitcoin.crypto.sha256(secret);// 
      // console.log("secret_hash", secretHash.toString('hex'));
      // // return claimContract.populateTransaction["bob_claim"](convertToAsciiHex(localStorage.getItem('origin_secret')));
      const origin_secret = localStorage.getItem(order.transaction_hash)
      // alert(origin_secret)
      return claimContract.populateTransaction["bob_claim"](convertToAsciiHex(origin_secret ? origin_secret : "345"));
    } catch (error) {
      console.log('异常提取');
      return null
    }
  }, [claimContract]);
  const calls_withdraw = useMemo(() => {
    try {
      if (!address) return [];
      if (claim_contract_address === "") return;
      // const origin_secret = localStorage.getItem('origin_secret');
      // const origin_secret = '123';
      // console.log("convertToAsciiHex(localStorage.getItem('origin_secret'))", convertToAsciiHex(origin_secret));
      // const secret = Buffer.Buffer.from(origin_secret.toString(), 'utf-8');
      // const secretHash = bitcoin.crypto.sha256(secret);// 
      // console.log("secret_hash", secretHash.toString('hex'));
      // // return claimContract.populateTransaction["bob_claim"](convertToAsciiHex(localStorage.getItem('origin_secret')));
      // const origin_secret = localStorage.getItem(order.transaction_hash)
      // alert(origin_secret)
      return withdrawContract.populateTransaction["alice_withdraw"]();
    } catch (error) {
      console.log('异常提取');
      return null
    }
  }, [withdrawContract]);
  const {
    writeAsync: claimMoney
  } = useContractWrite({
    calls: calls_claim
  })
  const {
    writeAsync: withdrawMoney
  } = useContractWrite({
    calls: calls_withdraw
  })
  const handleMenuClick = (e) => {
    console.log('click', e);
  };
  const handleRefresh = () => {

    fetchData()
  }
  const fetchData = async () => {

    try {
      setLoading(true);
      const data = await get_order_list(btcAddress, address)
      setUserOrderList(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };


  const items = [
    {
      label: '1',
      key: '1',
      icon: <UserOutlined />,
    },
  ];
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderid) => (
        <span>
          {orderid}
          <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
        </span>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => <div style={{ width: '90px' }}>{new Date(timestamp).toLocaleString()}</div>,
    },
    {
      title: 'Node ID',
      dataIndex: 'node_id',
      key: 'node_id',
    },
    {
      title: 'Type',
      key: 'swaptype',
      dataIndex: 'swaptype',
      render: (swaptype) => (<div style={{ color: '#00D889' }}>{swaptype}</div>),
    },
    {
      dataIndex: 'hashlock',
      title: 'LockHash',
      key: 'hashlock',
      render: (value) => (
        <span>
          {value && displayCustomString(value)}
          <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
        </span>

      )
    },
    // {
    //   title: 'Price',
    //   dataIndex: 'amount_in',
    //   key: 'amount_in',
    // },
    {
      title: 'Amount In',
      dataIndex: 'amount_in',
      key: 'amount_in',
      render: (amount_out, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              {amount_out}
            </>
          )
        } else {
          return <>
            <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
            {amount_out}
          </>
        }
      },
    },
    {
      title: 'Amount Lock',
      dataIndex: 'amount_out',
      key: 'amount_out',
      render: (amount_out, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              {amount_out}
            </>
          )
        } else {
          return <>
            <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
            {amount_out}
          </>
        }
      },
    },
    {
      title: 'Tx hash',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (transaction_hash, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <a href={'https://mempool.space/testnet/tx/' + transaction_hash} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              {obj && obj.transaction_hash && displayCustomString(obj.transaction_hash)}
            </a>
          )
        } else {
          return (<a href={'https://sepolia.voyager.online/tx/' + transaction_hash} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} />
            {obj && obj.transaction_hash && displayCustomString(obj.transaction_hash)}
          </a>)
        }
      },
    },
    {
      title: 'Tx hash claim',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (transaction_hash, obj) => {
        if (!obj.transaction_hash_claim) return <></>
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <a href={'https://sepolia.voyager.online/tx/' + obj.transaction_hash_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              {obj && obj.transaction_hash_claim && displayCustomString(obj.transaction_hash_claim)}
            </a>
          )
        } else {
          return (<a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} />
            {obj && obj.transaction_hash_claim && displayCustomString(obj.transaction_hash_claim)}
          </a>)
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val, obj) => {
        if (obj.transaction_hash_pool && obj.status == 1) {

          // 渲染 'completed' 状态的内容
          return (
            <Button
              className='qs'
              shape='round'
              onClick={() => {
                setOrder(obj)
                //判断claim类型并进行claim
                //增加判断是否已经连接上了两个钱包，如果其中一个没连接上，直接
                if (obj.swaptype == action_swapStark2BTC) {
                  // claimBtc();
                  if (!btcAddress || btcAddress === '') {
                    handleBitcoinClick();
                    return;
                  }
                  if (!address || address === '') {
                    handleStarknetClick();
                    return
                  }
                  //增加判断是否设置privateKey 以及是否Private的Ac 跟unisat钱包一直
                  const btc_privatekey = localStorage.getItem('btc_privatekey')
                  if (!btc_privatekey) {
                    message.error("please set private key first!")
                    setModalVisible(true)
                    return;
                  }
                  const publicKey = getBtcAcc()
                  if (publicKey != btcPublicKey) {
                    message.error("current wallet's public key is different with private key, please reset")
                    setModalVisible(true)
                    return;
                  }
                  console.log('obj.transaction_hash', obj.transaction_hash);
                  const origin_secret = localStorage.getItem(obj.transaction_hash)
                  let claim_gasFee = btcGasFee;
                  if (claim_gasFee < minGasFee) {
                    claim_gasFee = minGasFee
                  }
                  const notification_key = openNotificationWithIcon('warning', 'please wait tx to process', 30, false);
                  const param = {
                    value: Math.floor(obj.amount_out * satoshi_unit - claim_gasFee),
                    node_btcpublickey: obj.node_btc_publickey,
                    origin_secret: origin_secret ? origin_secret : '123',
                    btc_privatekey: localStorage.getItem('btc_privatekey'),
                    tx_id: obj.transaction_hash_pool
                  }
                  console.log("param", param, obj);
                  console.log("value", obj.amount_out * satoshi_unit, claim_gasFee);

                  unLockMoneyIntoBTCAccount(param).then(res => {
                    // console.log('get_btc', res);
                    if (res.code == 200) {
                      claim_money_succeed({
                        order_id: obj.order_id,
                        origin_secret: localStorage.getItem(obj.transaction_hash),
                        transaction_hash_claim: res.tx_id
                      }).then(res => {
                        api.destroy(notification_key)
                        openNotificationWithIcon('success', 'BTC claim Succed!', 3);
                        message.success('BTC claim Succed!')
                        fetchData();
                      })
                      updateNodeListIncreaseTvl({
                        increase_amount_strk: 0,
                        increase_amount_BTC: obj.amount_out,
                        node_id: obj.node_id
                      })

                    } else {
                      // message.error('tx failed please try again!', res.error)
                      message.error({
                        content: 'tx failed please try again!' + res.error,
                        duration: 5, // 设置消息显示时间为10秒
                      });
                      api.destroy(notification_key)
                      getBtcGasFee(obj.node_btcaddress).then(res => {
                        console.log('gasFee', res.economyFee, data_mount);
                        if (res.economyFee) {
                          setBtcGasFee(res.economyFee * data_mount)
                        }
                      })

                    }
                  })

                } else {
                  setClaimContractAddress(obj.transaction_hash_pool);

                }

                // claimMoney.updat

              }}
              style={{ background: '#00D889' }}
            >
              claim
            </Button>
          );
        } else if (obj.status == 2 || obj.status == 3) {
          // 渲染 'error' 状态的内容
          return <><CheckCircleOutlined /> Succeed</>
        } else if (obj.status == 0) {
          // console.log('withraw_contract',Date.now() - obj.timestamp);

          // if (Date.now() - new Date(obj.timestamp) > 6 * 1000) {
          //   return <Button
          //     onClick={() => {
          //       if (obj.swaptype == action_swapBtc2Stark) {
          //         //alice取回自己的BTC
          //         let claim_gasFee = btcGasFee;
          //         if (claim_gasFee < minGasFee) {
          //           claim_gasFee = minGasFee
          //         }
          //         const param = {
          //           value: Math.floor(obj.amount_in * satoshi_unit - claim_gasFee),
          //           node_btcpublickey: obj.node_btc_publickey,
          //           origin_secret: localStorage.getItem(obj.transaction_hash),
          //           btc_privatekey: localStorage.getItem('btc_privatekey'),
          //           tx_id: obj.transaction_hash
          //         }
          //         unLockMoneyIntoBTCAccount_withdraw(param).then(res => {

          //         })
          //       } else {
          //         //alice 取回自己的stark币
          //         setOrder(obj)
          //         const notification_key = openNotificationWithIcon('warning', 'please wait tx to process', 30, false);
          //         get_transactionhash_result(obj.transaction_hash, obj.user_strkaddress).then(res => {
          //           if (!res) return;
          //           setWithdrawContractAddress(res)
          //         })
          //       }
          //     }}
          //     className='qs'
          //     style={{ background: '#00D889' }}
          //     shape='round'>

          //     withdraw
          //   </Button>
          // }
          // 渲染 'processing' 状态的内容
          return <><SyncOutlined spin /> Processing </>
        } else {
          return <> cancel </>
        }
        // return (
        //   obj.transaction_hash_pool  ? (
        //     <Button 
        //       className='qs' 
        //       shape='round' 
        //       onClick={() => {
        //         setClaimContractAddress(obj.transaction_hash_pool);
        //         claimMoney();
        //       }} 
        //       style={{ background: '#00D889' }}
        //     >
        //       claim
        //     </Button>
        //   ) : (
        //     <>Processing</>
        //   )
        // );
      }
    }
    // {
    //   title: 'Action',
    //   dataIndex: 'action',
    //   key: 'action',
    //   render: () => <span style={{}}>waiting node Processing</span>,
    // },
  ];
  const widthSize = () => {
    setSreenWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", widthSize);
    fetchData();
    getBtcGasFee().then(res => {
      console.log('gasFee', res.economyFee, data_mount);
      if (res.economyFee) {
        setBtcGasFee(res.economyFee * data_mount)
      }
    })
    return () => {
      // clearInterval(timer);
      window.removeEventListener("resize", widthSize);
    };
  }, [address, btcAddress]);
  // console.log("orderList", userOrderList);
  useEffect(() => {
    console.log('claim1!!!!!!!!!!!!!!!!!!');

    if (claim_contract_address) {
      // 设置 claimContract
      // setClaimContract(/* 根据 claimContractAddress 获取合约实例的代码 */);
      // const notification_key = openNotificationWithIcon('warning', 'please wait tx to process', 30, false);
      try {
        const result = claimMoney();
        setClaimContractAddress(null)
        result.then(res => {
          //交易成功更新状态位success
          claim_money_succeed({
            order_id: order.order_id,
            origin_secret: localStorage.getItem(order.transaction_hash),
            transaction_hash_claim: res.transaction_hash
          }).then(res => {
            // console.log('res', res);
            openNotificationWithIcon('success', 'claim success', 3);

            message.success('transaction succeed!')
            fetchData();
          })
          //更新服务器的交易额: tvl+=order.amount_out
          updateNodeListIncreaseTvl({
            increase_amount_strk: order.amount_out,
            increase_amount_BTC: 0,
            node_id: order.node_id
          })

        })
      } catch (error) {

        message.error("failed to claim!")
        console.log("异常提取！！");
        return null
      }

    }
  }, [claim_contract_address]);
  useEffect(() => {
    if (withdrawContract == null) return;
    // if (claim_contract_address) {
    //   // 设置 claimContract
    //   // setClaimContract(/* 根据 claimContractAddress 获取合约实例的代码 */);
    const result = withdrawMoney();
    setWithdrawContractAddress(null)
    result.then(res => {
      withdraw_money_succeed({
        order_id: order.order_id,
        transaction_hash_claim: res.transaction_hash,
        status: 10
      }).then(res => {
        openNotificationWithIcon('success', 'claim success', 3);
        // api.destroy(notification_key)
        message.success('transaction succeed!')
        fetchData();
      })
    })

  }, [withdrawContract]);
  return (

    <div className='order'>
      {contextHolder}
      <div className='ltop'>
        <div className='l' >
          {/* <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                Buy/Sell
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                All Token
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown menu={menuProps}>
            <Button style={{ border: '1px solid #5c5c5c', color: '#fff' }} ghost>
              <Space>
                All Status
                <DownOutlined style={{ fontSize: '10px' }} />
              </Space>
            </Button>
          </Dropdown> */}
          <Button
            style={{ border: '1px solid #5c5c5c', color: '#fff', width: 200, fontSize: 15 }}
            ghost
            onClick={handleRefresh}
          >
            {/* <ReloadOutlined style={{ fontSize: '15px', verticalAlign: 'middle' }} /> */}
            Refresh Data
          </Button>

        </div>
        {/* <div className='r'>
          <Button type="link">
            Make a pool
          </Button>
        </div> */}
      </div>

      <div className='tables'>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : userOrderList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="please connect wallet first"
          >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden', marginRight: '10px' }}>
                <img src={btcimg} alt="Description of the image" style={{ height: 20, marginRight: '10px' }} />
                <button
                  className="text-xs text-white bg-gray-700 px-2 py-1 rounded-full mx-1"
                  style={{ position: 'relative', overflow: 'hidden' }}
                  onClick={() => handleBitcoinClick()}
                >
                  {btcAddress ? btcAddress.substring(0, 8) + '...' + btcAddress.substring(btcAddress.length - 8, btcAddress.length) : 'Connect OKX'}
                  <i className="fas fa-chevron-down ml-2"></i>
                  <span className="border-green-400 border-2 absolute inset-0 rounded-full hover:animate-spin-hover"></span>
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                <img src={strkimg} alt="Description of the image" style={{ height: 20, marginRight: '10px' }} />
                <button
                  className="text-xs text-white bg-gray-700 px-2 py-1 rounded-full mx-1"
                  style={{ position: 'relative', overflow: 'hidden' }}
                  onClick={() => handleStarknetClick()}
                >
                  {address ? address.substring(0, 8) + '...' + address.substring(address.length - 8, address.length) : 'Connect Wallet'}
                  <i className="fas fa-chevron-down ml-2"></i>
                  <span className="border-green-400 border-2 absolute inset-0 rounded-full hover:animate-spin-hover"></span>
                </button>
              </div>
            </div>
          </Empty>

        ) : (
          <Table
            style={{ maxWidth: screenWidth - 50 }}
            dataSource={userOrderList}
            columns={columns}
            pagination={false}
            bordered={false}
            scroll={{ x: 800 }}
          />
        )}
      </div>
      <PrivateKeyModal visible={modalVisible} onCancel={() => { setModalVisible(false) }} />
    </div>
  );
}
const PrivateKeyModal = (props) => {
  const [privateKey, setPrivateKey] = useState('');
  const handleOk = () => {
    // 在这里处理用户点击确认按钮后的逻辑
    // console.log('Private Key:', privateKey);
    localStorage.setItem("btc_privatekey", privateKey)
  };
  const inputPrivateKeyModal = (
    <Modal
      className='custom-modal'
      title="Save private key"
      open={props.visible}
      onCancel={props.onCancel}
      footer={
        <Button ghost key="submit" className='bts' onClick={() => {
          localStorage.setItem("btc_privatekey", privateKey)

          props.onCancel()
        }}>
          save key
        </Button>
      }
      onOk={() => {
        localStorage.setItem("btc_privatekey", privateKey)
        props.onCancel()
      }}
      style={{ color: 'white' }} // 设置 Modal 的字体颜色为白色
    >
      <br />
      <Input
        type='password'
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
        placeholder="private key"
        style={{ color: 'black' }} // 设置输入框的字体颜色为黑色，以确保可见
      />
      <p style={{ marginTop: '10px', fontSize: "15px", color: "red" }}>Note:this is testnet version of starknet, We won't get your privatekey. If you worry about losing money, please use your testnet wif.</p>
    </Modal>
  );

  return (
    <>
      {inputPrivateKeyModal}
    </>
  );
};