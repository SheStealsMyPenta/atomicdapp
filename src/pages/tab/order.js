import { DownOutlined, UserOutlined, CopyOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Dropdown, Table, Button, Spin, Empty, Tag } from 'antd';
import { Space } from 'antd';
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { action_swapBtc2Stark, action_swapStark2BTC, baseUrl, satoshi_unit, swapBtc2Stark, swapStark2Btc, token_contract_address } from '../../static/Const';
import { WalletContext } from '../../WalletContext';
import { useAccount, useContract, useContractWrite } from '@starknet-react/core';
import { render } from '@testing-library/react';
import { claim_money_succeed, get_order_list, unLockMoneyIntoBTCAccount, unLockMoneyIntoBTCScript } from '../../Utils/AtomicService';
import { message } from 'antd';
import { abi, claimAbi } from '../../static/abi';
import { convertToAsciiHex, displayCustomString } from '../../Utils/Common';
import * as bitcoin from '../../bitcoinjs-lib';
import btcimg from '../../assets/btc.png'
import strkimg from '../../assets/strk.png'
import * as Buffer from '../../safe-buffer';
export default function Order() {
  const [loading, setLoading] = useState(true);
  const [claim_contract_address, setClaimContractAddress] = useState(null)
  const [order_id, setOrder_id] = useState(null)
  const { address } = useAccount();

  const {
    btcAddress,
    userOrderList,
    setUserOrderList
  } = useContext(WalletContext);
  const { contract: strk_contract } = useContract({
    abi: abi,
    address: token_contract_address,  //strk contract address;
  });
  const { contract: claimContract } = useContract({
    abi: claimAbi,
    address: claim_contract_address
  })

  const calls_claim = useMemo(() => {
    if (!address) return [];
    if (claim_contract_address === "") return;
    // const origin_secret = localStorage.getItem('origin_secret');
    const origin_secret = '123';
    console.log("convertToAsciiHex(localStorage.getItem('origin_secret'))", convertToAsciiHex(origin_secret));
    const secret = Buffer.Buffer.from(origin_secret.toString(), 'utf-8');
    const secretHash = bitcoin.crypto.sha256(secret);// 
    console.log("secret_hash", secretHash.toString('hex'));
    // return claimContract.populateTransaction["bob_claim"](convertToAsciiHex(localStorage.getItem('origin_secret')));
    return claimContract.populateTransaction["bob_claim"](convertToAsciiHex('123'));
  }, [claimContract]);

  const {
    writeAsync: claimMoney
  } = useContractWrite({
    calls: calls_claim
  })
  const handleMenuClick = (e) => {
    console.log('click', e);
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await get_order_list(btcAddress, null)
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
    {
      title: 'Price',
      dataIndex: 'amount_in',
      key: 'amount_in',
    },
    {
      title: 'Amount In',
      dataIndex: 'amount_in',
      key: 'amount_in',
    },
    {
      title: 'Amount Out',
      dataIndex: 'amount_out',
      key: 'amount_out',
    },
    {
      title: 'Tx hash',
      dataIndex: 'transaction_hash',
      key: 'transaction_hash',
      render: (transaction_hash, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <a href={'https://sepolia.voyager.online/contract/' + obj.transaction_hash_pool} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <span>
                {transaction_hash && displayCustomString(transaction_hash)}
                <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
              </span>
              <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} />
            </a>
          )
        } else {
         return  <a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash_pool} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <span>
              {transaction_hash && displayCustomString(transaction_hash)}
              <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
            </span>
            <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '5px', height: '20px' }} />
          </a>
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
                //判断claim类型并进行claim
                if (obj.swaptype == action_swapStark2BTC) {
                  // claimBtc();
                  const param = {
                    value: obj.amount_out * satoshi_unit,
                    node_btcpublickey: obj.node_btc_publickey,
                    origin_secret: '123',
                    btc_privatekey: localStorage.getItem('btc_privatekey'),
                    tx_id: obj.transaction_hash_pool
                  }
                  console.log("param", param, obj);
                  unLockMoneyIntoBTCAccount(param).then(res => {
                    console.log('get_btc', res);
                    if (res.code == 200) {
                      claim_money_succeed(order_id)
                      message.success('BTC claim Succed!!!')
                    }
                  })

                } else {
                  setClaimContractAddress(obj.transaction_hash_pool);
                }
                setOrder_id(obj.order_id)
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
        } else {
          // 渲染 'processing' 状态的内容
          return <><SyncOutlined spin /> Processing </>
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

  useEffect(() => {
    fetchData();
  }, [address, btcAddress]);
  console.log("orderList", userOrderList);
  useEffect(() => {
    if (claim_contract_address) {
      // 设置 claimContract
      // setClaimContract(/* 根据 claimContractAddress 获取合约实例的代码 */);
      try {
        const result = claimMoney();
        result.then(res => {
          //交易成功更新状态位success
          claim_money_succeed(order_id)
          fetchData();
          message.success('transaction succeed!')
        })
      } catch (error) {
        console.log("eoor", error);
        message.error('user abort')
      }



    }
  }, [claim_contract_address]);
  return (

    <div className='order'>
      <div className='ltop'>
        <div className='l'>
          <Dropdown menu={menuProps}>
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
          </Dropdown>
        </div>
        <div className='r'>
          <Button type="link">
            Make a pool
          </Button>
        </div>
      </div>
      <div className='tables'>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : userOrderList.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
        ) : (
          <Table
            scroll={{ x: 1300 }}
            columns={columns}
            dataSource={userOrderList}
            rowKey="orderid"
          />
        )}
      </div>
    </div>
  );
}