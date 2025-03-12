import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Table,
  Button,
  Switch,
  Space,
  Select,
  message,
  Row,
  Col,
  Descriptions,
  Skeleton,
} from 'antd';
import axios from 'axios';
import { DetailPopover } from '@/components';
import useModalTemplate from '@/hooks/useModalTemplate';
import { PAGE_SIZE_MAX, LADDER } from '@/common/enum';
import {
  getFirstPinyinLetter,
  formatPrice,
  scalePrice,
  isScalePrice,
} from '@/common/util';
import Details from './details';
import Reckoner from './reckoner';
import columns from './columns';
// import stocks from './stocks.json';

const CancelToken = axios.CancelToken;
let source = CancelToken.source();

const App = () => {
  const dataToShowMap = useRef({}).current;
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState([]);
  const [dataToShow, setDataToShow] = useState([]);
  const [isNewDate, setIsNewData] = useState(true);
  const { open: detail, ...detailProps } = useModalTemplate(); // 详情
  const { open: reckoner, ...reckonerProps } = useModalTemplate(); // 计算器

  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE_MAX;
    const endIndex = startIndex + PAGE_SIZE_MAX;
    const _dataToShow: any = stocks.slice(startIndex, endIndex);

    setDataToShow(_dataToShow);
    isNewDate && fetchAllData(_dataToShow);
  }, [currentPage]);

  const onPageClick = (page: any) => {
    setCurrentPage(page);
  };

  const fetchData = (codes: string) => {
    return axios.get(`https://qt.gtimg.cn/q=${codes}`);
  };

  const fetchAllData = async (dataToShow: any) => {
    setLoading(false);
    try {
      let dataToShows = [];
      if (dataToShowMap[currentPage]) {
        dataToShows = dataToShowMap[currentPage];
      } else {
        // 发起所有查询请求
        const codes = dataToShow.map(
          (item: any) => `${item?.exchange?.toLocaleLowerCase()}${item.code}`,
        );
        const promiseStr = await fetchData(codes);
        const promiseList = promiseStr?.data
          ?.replace(/\n/g, '')
          .split(';')
          .slice(0, -1);

        dataToShows = promiseList.map((p: string) => {
          const codeMatches = p.match(/v_([a-zA-Z0-9]+)/g);
          const exchangeCode = codeMatches?.[0]?.substring(2) || '';

          // 匹配以双引号中的波浪线 "~" 分割的字符串
          const dataMatches = p.match(/"([^"]*)"/g);
          const dataArray = dataMatches?.[0]?.split('~') || [];
          const name = dataArray?.[1];
          const code = dataArray?.[2];
          const CNYPrice = dataArray?.[3];

          return {
            name,
            CNYPrice,
            code,
            exchange: exchangeCode.replace(/\d+$/, ''),
          };
        });

        // 并行等待所有请求完成
        dataToShowMap[currentPage] = dataToShows;
      }
      setLoading(true);
      setCurrentData(dataToShows);
    } catch (error) {
      fetchAllData(dataToShow);
      message.error(JSON.stringify(error));
      console.error('Error fetching all data:', error);
    }
  };

  const dataSource = useMemo(() => {
    const allDataMap = currentData.reduce((map, item: any) => {
      const keyCode = item?.code;
      const keyName = item?.name?.trim() || '';
      const price = item?.CNYPrice || 0;
      const exchange = item?.exchange || 'sz';
      const code = item?.code || 0;
      map[keyCode] = {
        price,
        code,
        exchange,
      };
      map[keyName] = {
        price,
        code,
        exchange,
      };
      return map;
    }, {});

    // console.log('====================================');
    // console.log(allDataMap);
    // console.log('====================================');

    const list = dataToShow.map((item: any) => ({
      ...item,
      code: allDataMap[item.code || item.name]?.code || null,
      CNYPrice: allDataMap[item.code || item.name]?.price || null,
      exchange: allDataMap[item.code || item.name]?.exchange || null,
    }));

    // console.log('=============list=======================');
    // console.log(list.map(({ name, code, price, exchange }) => ({  name, code, price, exchange })));
    // console.log('===============list=====================');

    return list;
  }, [currentData]);

  const stocks = useMemo(() => JSON.parse(localStorage.getItem('stockList') as any || '[]'), []);

  const cancel = () => {
    source.cancel('取消所有请求');
    source = CancelToken.source();
    setLoading(true);
  };

  const TableRes = ({ position = ['bottomRight'] }) => {
    return (
      <Table
        rowKey={(record, index) =>
          `${record?.code || record?.name}_${record.price}_${index}`
        }
        dataSource={dataSource}
        columns={[
          ...(columns as any),
          {
            title: '操作',
            key: 'operation',
            fixed: 'right',
            width: 100,
            render: (text, record, index) => (
              <Button
                type='link'
                onClick={() => {
                  detail?.({
                    props: {
                      title: '详情',
                      record,
                    },
                    record,
                    closeForm: true,
                  }).then(() => new Promise((resolve: any) => resolve()));
                }}
              >
                详细
              </Button>
            ),
          },
        ]}
        loading={!loading}
        onChange={pagination => {
          onPageClick(pagination.current);
        }}
        pagination={{
          simple: true,
          position,
          current: currentPage,
          total: stocks.length,
          pageSize: PAGE_SIZE_MAX,
          showSizeChanger: false,
          itemRender: (_, type, originalElement) => {
            if (type === 'prev') {
              return <a>上一页</a>;
            }
            if (type === 'next') {
              return <a>下一页</a>;
            }
            return originalElement;
          },
        }}
        scroll={{ x: 1300, y: 500 }}
      />
    );
  };

  const copyText = (item: any) => {
    // 创建一个虚拟的 textarea 元素，将文本复制到其中
    let isSPrice = false;
    const sPrice = LADDER.map(s => {
      !isSPrice &&
        (isSPrice = isScalePrice(
          item.CNYPrice,
          Number(scalePrice(item.price, s)),
          s,
        ));
      if (isSPrice) {
        return `${s} 👉 ${scalePrice(item.price, s)}`;
      }
      return false;
    });
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = sPrice.filter(Boolean).join('\n');
    document.body.appendChild(tempTextarea);

    // 选择文本
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999);

    // 尝试复制文本
    document.execCommand('copy');

    // 移除虚拟元素
    document.body.removeChild(tempTextarea);

    // 提示用户复制成功
    message.info('复制成功');
  };

  return (
    <div className='App'>
      <div style={{ textAlign: 'left' }}>
        <Space wrap>
          <Switch defaultChecked onChange={setIsNewData} />
          {/* <Button type='dashed' size='large' onClick={() => {
            window.open('http://localhost:7001/information/equityMicro/sl?equityNo=5080000000028891')
          }}>
            open
          </Button> */}
          <Button.Group>
            <Button type='dashed' size='large' onClick={() => cancel()}>
              取消请求
            </Button>
            <Button
              type='primary'
              size='large'
              onClick={() => fetchAllData(dataToShow)}
            >
              获取最新数据
            </Button>
          </Button.Group>
          <Button
              type='dashed'
              size='large'
              onClick={() => {
                reckoner?.({
                  props: {
                    title: '计算器',
                  },
                  closeForm: true,
                }).then(() => new Promise((resolve: any) => resolve()));
              }}
            >
              计算器
            </Button>
          <Select
            showSearch
            // onSelect={(value: string) => {
            //   const [code, name] = value.split('_');
            //   fetchAllData([{ code, name }]);
            // }}
            placeholder={'筛选票子'}
            style={{ width: '160px' }}
            options={stocks.map((item, index) => ({
              label: `${Math.ceil((index + 1) / PAGE_SIZE_MAX)}/${item.name}(${
                item.code
              })`,
              value: `${item.code}_${item.price}_${index}`,
            }))}
            filterOption={(input: any, option: any) =>
              `${option?.label}_${option?.value}_${getFirstPinyinLetter(
                option?.label,
              )}`
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Space>
      </div>

      <Row>
        <Col xs={24} md={0} style={{ marginTop: '20px' }}>
          <Skeleton loading={!loading} active>
            {/* 在小屏幕上显示摘要信息 */}
            {dataSource.map((item, index) => {
              return (
                <div onDoubleClick={() => copyText(item)}>
                  <Descriptions
                    title={
                      <DetailPopover
                        text={`${item.name} / ${item.code} / 股价:${item.price} / 收盘价:${item.CNYPrice}`}
                        code={item.code}
                        exchange={item.exchange}
                        placement='top'
                      />
                    }
                    column={3}
                    key={index}
                  >
                    {LADDER.map((lItem, key) => {
                      return (
                        <Descriptions.Item label={lItem} key={key}>
                          {formatPrice(item, lItem)}
                        </Descriptions.Item>
                      );
                    })}
                  </Descriptions>
                </div>
              );
            })}
          </Skeleton>
        </Col>
        <Col xs={24} md={0}>
          {/* 在中大屏幕上显示表格 */}
          <TableRes position={['topRight']} />
        </Col>
        <Col xs={0} md={24}>
          {/* 在中大屏幕上显示表格 */}
          <TableRes />
        </Col>
      </Row>
      <Details {...detailProps} />
      <Reckoner {...reckonerProps}/>
    </div>
  );
};

export default App;
