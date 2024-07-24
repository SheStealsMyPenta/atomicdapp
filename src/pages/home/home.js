import React, { useState, useEffect, useContext } from 'react'
import './home.css'
import { Tabs } from 'antd/es';
import Listing from '../tab/listing';
import Order from '../tab/order';
import History from '../tab/history';
import '../tab/All.css'
import imgs from '../../assets/bt.svg'
import imgs1 from '../../assets/node.svg'
import imgs2 from '../../assets/tvl.svg'
import { WalletContext } from '../../WalletContext';
import { get_order_list } from '../../Utils/AtomicService';
import { baseUrl } from '../../static/Const';
import { useAccount } from '@starknet-react/core';
export default function Home() {

  const [overviewData, setOverviewData] = useState(null);
  const [currentTab, setCurrentTab] = useState("1");
  const {address }=  useAccount()
  const {
    btcAddress,
    userOrderList,
    setUserOrderList
  } = useContext(WalletContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(baseUrl + 'api/v1/overview');
        const data = await response.json();
        setOverviewData(data.overview[0]);
        console.log('data.overview', data.overview);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      }
    };

    fetchData();
  }, []);

  const list = [
    { icon: (<img src={imgs} style={{ height: '32px' }} alt="" />), title: 'BTC supply', value: overviewData?.btcsupply || 0 },
    { icon: (<img src={imgs} style={{ height: '32px' }} alt="" />), title: 'STRK supply', value: overviewData?.strksupply || 0 },
    { icon: (<img src={imgs1} alt="" />), title: 'Node', value: overviewData?.node || 0 },
    { icon: (<img src={imgs2} alt="" />), title: 'TVL_BTC', value: overviewData?.tvl_btc || 0 },
    // { icon: (<img src={imgs2} alt="" />), title: 'TVL_STRK', value: overviewData?.tvl_strk || 0 }
  ];



  const onChange = async (key) => {
    setCurrentTab(key)
    if (key == 3) {
      //点击更新订单列表
      const data = await get_order_list(btcAddress,address);
      setUserOrderList(data)
    }
  };
  const items = [
    {
      key: '1',
      label: 'Listing',
      children: (
        <Listing time={new Date()} />
      )
    },
    {
      key: '2',
      label: 'Order History',
      children: (
        <History currentTab={currentTab}/>
      ),
    },
    {
      key: '3',
      label: 'My Order',
      children: (
        <Order />
      ),
    },
  ];
  return (
    <div className='home' style={{ width: '100% !important' }}>
      <div className='top'>
        <h2>Overview</h2>
        <ul>
          {list.map((e, i) => {
            return (
              <li key={i}>
                <div className='t'>
                  {e.icon}
                  <span>{e.title}</span>
                </div>
                <div className='b'>
                  {e.value}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className='bot'>
        <h2 style={{ marginBottom: '28px' }}>Pools</h2>
        <div className='tab'>
          <Tabs tabBarGutter={33} defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
