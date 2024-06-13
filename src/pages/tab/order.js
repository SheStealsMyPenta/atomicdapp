import { DownOutlined, UserOutlined, CopyOutlined } from '@ant-design/icons';
import { Dropdown, Table, Button, Spin, Empty } from 'antd';
import { Space } from 'antd';
import React, { useEffect, useState } from 'react';

export default function Order() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMenuClick = (e) => {
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
      dataIndex: 'orderid',
      key: 'orderid',
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
      render: (swaptype) => <div style={{ color: '#00D889' }}>{swaptype}</div>,
    },
    {
      dataIndex: 'hashlock',
      title: 'LockHash',
      key: 'hashlock',
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
      render: (transaction_hash) => (
        <span>
          {transaction_hash}
          <CopyOutlined style={{ color: '#00D889', marginLeft: '8px', cursor: 'pointer' }} />
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val) => <span style={{ color: '#00D889' }}>{console.log("val----",val)}</span>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: () => <span style={{  }}>waiting node Processing</span>,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userBTCAddress = 'user_btcaddress_value';
        const userSTRKAddress = 'user_strkaddress_value';

        const url = `http://localhost:4000/api/v1/userOrder?user_btcaddress=${userBTCAddress}&user_strkaddress=${userSTRKAddress}`;
        const response = await fetch(url);
        
        const data = await response.json();
        console.log("data---",data);
        // alert(JSON.stringify(data))
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        ) : data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
        ) : (
          <Table
            scroll={{ x: 1300 }}
            columns={columns}
            dataSource={data}
            rowKey="orderid"
          />
        )}
      </div>
    </div>
  );
}