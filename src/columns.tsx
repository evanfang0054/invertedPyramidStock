import React from 'react';
import { LADDER } from '@/common/enum';
import { formatPrice } from '@/common/util';
import { DetailPopover } from '@/components';

export default [
  {
    title: '股票名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    with: 320,
    render: (text, record, index) => {
      return (
        <DetailPopover
          exchange={record?.exchange}
          text={<a>{text}</a>}
          code={record?.code}
        />
      );
    },
  },
  {
    title: '股票代码',
    dataIndex: 'code',
    key: 'code',
    // fixed: 'left',
    with: 320,
  },
  {
    title: '股价',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '0.875',
    dataIndex: '0.875',
    key: '0.875',
    render: (text, record, index) => {
      return formatPrice(record, 0.875);
    },
  },
  {
    title: '0.809',
    dataIndex: '0.809',
    key: '0.809',
    render: (text, record, index) => {
      return formatPrice(record, 0.809);
    },
  },
  {
    title: '0.79',
    dataIndex: '0.79',
    key: '0.79',
    render: (text, record, index) => {
      return formatPrice(record, 0.79);
    },
  },
  {
    title: '0.75',
    dataIndex: '0.75',
    key: '0.75',
    render: (text, record, index) => {
      return formatPrice(record, 0.75);
    },
  },
  {
    title: () => {
      return <div style={{ backgroundColor: 'red' }}>0.667</div>;
    },
    dataIndex: '0.667',
    key: '0.667',
    render: (text, record, index) => {
      return formatPrice(record, 0.667);
    },
  },
  {
    title: () => {
      return <div style={{ backgroundColor: 'red' }}>0.618</div>;
    },
    dataIndex: '0.618',
    key: '0.618',
    render: (text, record, index) => {
      return formatPrice(record, 0.618);
    },
  },
  {
    title: '0.5',
    dataIndex: '0.5',
    key: '0.5',
    render: (text, record, index) => {
      return formatPrice(record, 0.5);
    },
  },
  {
    title: '0.42',
    dataIndex: '0.42',
    key: '0.42',
    render: (text, record, index) => {
      return formatPrice(record, 0.42);
    },
  },
  {
    title: '0.382',
    dataIndex: '0.382',
    key: '0.382',
    render: (text, record, index) => {
      return formatPrice(record, 0.382);
    },
  },
  {
    title: '0.32',
    dataIndex: '0.32',
    key: '0.32',
    render: (text, record, index) => {
      return formatPrice(record, 0.32);
    },
  },
  {
    title: '0.25',
    dataIndex: '0.25',
    key: '0.25',
    render: (text, record, index) => {
      return formatPrice(record, 0.25);
    },
  },
  {
    title: '0.236',
    dataIndex: '0.236',
    key: '0.236',
    render: (text, record, index) => {
      return formatPrice(record, 0.236);
    },
  },
  {
    title: '0.192',
    dataIndex: '0.192',
    key: '0.192',
    render: (text, record, index) => {
      return formatPrice(record, 0.192);
    },
  },
  {
    title: '0.125',
    dataIndex: '0.125',
    key: '0.125',
    render: (text, record, index) => {
      return formatPrice(record, 0.125);
    },
  },
  {
    title: '收盘价',
    dataIndex: 'CNYPrice',
    key: 'CNYPrice',
    fixed: 'right',
    with: 320,
  },
];
