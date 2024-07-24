import { DownOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Space, Table } from 'antd';
import { Button, Dropdown } from 'antd';
import React, { useState, useEffect } from 'react'
import { CopyOutlined } from '@ant-design/icons';
import { get_order_list, get_order_list_succeed } from '../../Utils/AtomicService';
import { render } from '@testing-library/react';
import { action_swapBtc2Stark, action_swapStark2BTC } from '../../static/Const';
import btcimg from '../../assets/btc.png'
import strkimg from '../../assets/strk.png'
import { displayCustomString } from '../../Utils/Common';
import { Spin } from 'antd';
import { Empty } from 'antd';
export default function History(props) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true);
  const [screenWidth, setSreenWidth] = React.useState(window.innerWidth);

  const fetchData = async (loading = true) => {
    if (loading) {
      try {
        setLoading(true);
        const data = await get_order_list_succeed()
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      const data = await get_order_list_succeed()
      setData(data);
    }
  };
  useEffect(() => {

    fetchData()
    // setInterval(fetchData(), 2000)

  }, [])
  const handleRefresh = () => {
    fetchData()
  }
  useEffect(() => {
    window.addEventListener("resize", widthSize);

    if (props.currentTab === "2") {
      // 设置定时器
     const timer = setInterval(() => {
        fetchData(false)
      }, 2 * 1000);

      console.log("!!!!!! in")

      return () => {
        console.log("!!!!!! out")
        clearInterval(timer);
      };
    }

    // 清除定时器
    return () => {
      window.removeEventListener("resize", widthSize);
    };
  }, [props.currentTab]);


  const widthSize = () => {
    setSreenWidth(window.innerWidth);
  };


  const handleMenuClick = (e) => {
    fetchData()
    console.log('click', e);
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
      width: 100
    },
    {
      title: 'User Address',
      dataIndex: 'user_btcaddress',
      // width: 300,
      key: 'user_btcaddress', fixed: 'left',
      render: (_, obj) => {
        return (
          <>
            <div>
              <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <span>{displayCustomString(obj.user_btcaddress)}</span>
            </div>
            <div>
              <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <span>{displayCustomString(obj.user_strkaddress)}</span>
            </div>
          </>
        )
      }
    },
    // {
    //   title: 'Time',
    //   dataIndex: 'timestamp',
    //   key: 'timestamp',
    //   // width: 100,
    //   render: (_) => <div style={{ width: '90px' }}>{_}</div>
    // },

    // {
    //   title: 'Type',
    //   key: 'swaptype',
    //   dataIndex: 'swaptype',
    //   render: (_) => <div style={{ color: '#00D889' }}>{_}</div>
    // },
    {
      title: 'Spend Amount',
      dataIndex: 'amount_in',
      key: 'amount_in',
      // width: 200,
      render: (_, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <>{_}</>
            </>
          )
        } else {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? btcimg : strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <>{_}</>
            </>
          )
        }
      },
    },
    {
      title: 'Receive Amount',
      dataIndex: 'amount_out',
      key: 'amount_out',
      // width: 200,
      render: (_, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <>{_}</>
            </>
          )
        } else {
          return (
            <>
              <img src={obj.swaptype == action_swapBtc2Stark ? strkimg : btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <>{_}</>
            </>
          )
        }
      },
    },
    {
      title: 'Server Address',
      dataIndex: 'node_btcaddress',
      // width: 170,
      // width: 300,
      key: 'node_btcaddress', fixed: 'left',
      render: (_, obj) => {
        return (
          <>
            <div>
              <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <span>{displayCustomString(obj.node_btcaddress)}</span>
            </div>
            <div>
              <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
              <span>{displayCustomString(obj.node_strkaddress)}</span>
            </div>
          </>
        )
      }
      // render: (_) => <span >{_}<CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: "pointer" }} /> </span>,
    },
    {
      title: 'User Spend',
      dataIndex: 'transaction_hash',
      // width: 170,
      key: 'user_btcaddress', fixed: 'left',
      render: (_, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash)}</>
              </a>
            </>
          )
        } else {
          return (
            <>
              <a href={'https://sepolia.voyager.online/tx/' + obj.transaction_hash} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash)}</>
              </a>
            </>
          )
        }
      }
      // render: (_) => <span >{_}<CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: "pointer" }} /> </span>,
    },
    {
      title: 'User Receive',
      dataIndex: 'transaction_hash_claim',
      // width: 170,
      key: 'user_btcaddress', fixed: 'left',
      render: (_, obj) => {
        if (obj.swaptype == action_swapStark2BTC) {
          return (
            <>
              <a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_claim)}</>
              </a>
            </>
          )
        } else {
          return (
            <>
              <a href={'https://sepolia.voyager.online/tx/' + obj.transaction_hash_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_claim)}</>
              </a>
            </>
          )
        }
      }
    },
    {
      title: 'Server Spend',
      dataIndex: 'transaction_hash',
      // width: 170,
      key: 'user_btcaddress', fixed: 'left',
      render: (_, obj) => {
        if (obj.swaptype == action_swapStark2BTC) {
          return (
            <>
              <a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash_pool} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_pool)}</>
              </a>
            </>
          )
        } else {
          return (
            <>
              <a href={'https://sepolia.voyager.online/contract/' + obj.transaction_hash_pool} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_pool)}</>
              </a>
            </>
          )
        }
      }
      // render: (_) => <span >{_}<CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: "pointer" }} /> </span>,
    },
    {
      title: 'Server Receive',
      dataIndex: 'transaction_hash_claim',
      // width: 170,
      key: 'user_btcaddress', fixed: 'left',
      render: (_, obj) => {
        if (obj.swaptype == action_swapBtc2Stark) {
          return (
            <>
              <a href={'https://mempool.space/testnet/tx/' + obj.transaction_hash_pool_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={btcimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_pool_claim)}</>
              </a>
            </>
          )
        } else {
          return (
            <>
              <a href={'https://sepolia.voyager.online/tx/' + obj.transaction_hash_pool_claim} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <img src={strkimg} alt="Description of the image" style={{ marginLeft: '', height: '20px' }} />
                <>{displayCustomString(obj.transaction_hash_pool_claim)}</>
              </a>
            </>
          )
        }
      }
      // render: (_) => <span >{_}<CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: "pointer" }} /> </span>,
    },
  ];

  // const data = [
  //   {
  //     key: '1',
  //     ID: 'note1475...q6ex9r',
  //     time: '2024-03-01 15:57:53',
  //     Order: '1709279873249',
  //     type: 'BUY',
  //     Token: 'TRICK',
  //     Price: '309 SAT5',
  //     Price1: '≈$0.0819',
  //     Remaining: '2,000',
  //     Amount: '2,000',
  //     Address: 'note1475...q6ex9r',
  //     Status: 'clairri',
  //     Action: 'Detail'
  //   },
  //   {
  //     key: '1',
  //     ID: 'note1475...q6ex9r',
  //     time: '2024-03-01 15:57:53',
  //     Order: '1709279873249',
  //     type: 'BUY',
  //     Token: 'TRICK',
  //     Price: '309 SAT5',
  //     Price1: '≈$0.0819',
  //     Remaining: '2,000',
  //     Amount: '2,000',
  //     Address: 'note1475...q6ex9r',
  //     Status: 'finish',
  //     Action: 'Detail'
  //   },
  //   {
  //     key: '1',
  //     ID: 'note1475...q6ex9r',
  //     time: '2024-03-01 15:57:53',
  //     Order: '1709279873249',
  //     type: 'BUY',
  //     Token: 'TRICK',
  //     Price: '309 SAT5',
  //     Price1: '≈$0.0819',
  //     Remaining: '2,000',
  //     Amount: '2,000',
  //     Address: 'note1475...q6ex9r',
  //     Status: 'Unfilled',
  //     Action: 'Detail'
  //   },
  //   {
  //     key: '1',
  //     ID: 'note1475...q6ex9r',
  //     time: '2024-03-01 15:57:53',
  //     Order: '1709279873249',
  //     type: 'BUY',
  //     Token: 'TRICK',
  //     Price: '309 SAT5',
  //     Price1: '≈$0.0819',
  //     Remaining: '2,000',
  //     Amount: '2,000',
  //     Address: 'note1475...q6ex9r',
  //     Status: 'Processing',
  //     Action: 'Detail'
  //   },

  // ];

  return (
    <div className='order'>
      {/* <div className='ltop'>
        <div className='l'> */}
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
      {/* <Button
            style={{ border: '1px solid #5c5c5c', color: '#fff', }}
            ghost
            onClick={handleRefresh}
          >
            <ReloadOutlined style={{ fontSize: '10px', verticalAlign: 'middle', }} />
            Refresh Data
          </Button> */}
      {/* </div>
      </div> */}

      <div className='tables'>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
        ) : (

          // <Table
          //   scroll={{ x: 1300}}
          //   columns={columns}
          //   dataSource={data}
          //   rowKey="orderid"
          // />

          <Table
            style={{ maxWidth: screenWidth - 50 }}
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered={false}
            scroll={{ x: 1300}}
          />

        )}
      </div>
    </div>
  )
}
