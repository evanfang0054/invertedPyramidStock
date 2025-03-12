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
  Skeleton,
  Statistic,
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
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { fadeIn } from '@/animations';
import { StopOutlined, CalculatorOutlined, SyncOutlined } from '@ant-design/icons';

const CancelToken = axios.CancelToken;
let source = CancelToken.source();

// 修改 StockData 接口定义，使其更严格
interface StockData {
  name: string;
  code: string | number;
  price?: number;
  CNYPrice: string | number;  // 移除可选标记
  exchange: string;  // 移除可选标记
}

interface DataToShowMap {
  [key: number]: StockData[];
}

interface AllDataMap {
  [key: string]: {
    price: number | string;
    code: string | number;
    exchange: string;
  };
}

// 添加样式组件
const StyledApp = styled.div`
  padding: 20px;
  
  .header-controls {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }

  .content-wrapper {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    overflow: hidden;
  }

  .mobile-card {
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-header {
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
  }
`;

const App = () => {
  const dataToShowMap = useRef<DataToShowMap>({}).current;
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState<StockData[]>([]);
  const [dataToShow, setDataToShow] = useState<StockData[]>([]);
  const [isNewDate, setIsNewData] = useState(true);
  const { open: detail, ...detailProps } = useModalTemplate(); // 详情
  const { open: reckoner, ...reckonerProps } = useModalTemplate(); // 计算器

  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE_MAX;
    const endIndex = startIndex + PAGE_SIZE_MAX;
    const _dataToShow: StockData[] = stocks.slice(startIndex, endIndex);

    setDataToShow(_dataToShow);
    isNewDate && fetchAllData(_dataToShow);
  }, [currentPage]);

  const onPageClick = (page: any) => {
    setCurrentPage(page);
  };

  const fetchData = (codes: string) => {
    return axios.get(`https://qt.gtimg.cn/q=${codes}`);
  };

  const fetchAllData = async (dataToShow: StockData[]) => {
    setLoading(false);
    try {
      let dataToShows: StockData[] = [];
      if (dataToShowMap[currentPage]) {
        dataToShows = dataToShowMap[currentPage];
      } else {
        // 发起所有查询请求
        const codes = dataToShow.map(
          (item: StockData) => `${item.exchange.toLowerCase()}${item.code}`,
        );
        // 将数组转换为字符串
        const codesStr = codes.join(',');
        const promiseStr = await fetchData(codesStr);
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
    const allDataMap: AllDataMap = currentData.reduce((map: AllDataMap, item: StockData) => {
      const keyCode = item?.code;
      const keyName = item?.name?.trim() || '';
      const price = item?.CNYPrice || 0;
      const exchange = item?.exchange || 'sz';
      const code = item?.code || 0;
      
      if (keyCode) {
        map[keyCode.toString()] = {
          price,
          code,
          exchange,
        };
      }
      
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

    const list = dataToShow.map((item: StockData) => ({
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

  const TableRes = ({ position = ['bottomRight'] as ('bottomRight' | 'topRight')[]}): JSX.Element => {
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

  const copyText = (item: StockData) => {
    let isSPrice = false;
    const sPrice = LADDER.map(s => {
      const itemPrice = Number(item.price || 0);
      const itemCNYPrice = Number(item.CNYPrice || 0);
      
      !isSPrice &&
        (isSPrice = isScalePrice(
          itemCNYPrice,
          Number(scalePrice(itemPrice, s)),
          s,
        ));
      if (isSPrice) {
        return `${s} 👉 ${scalePrice(itemPrice, s)}`;
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
    <StyledApp>
      <motion.div 
        className="header-controls"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Space wrap size={[16, 16]} align="center">
          <Switch 
            defaultChecked 
            onChange={setIsNewData}
            checkedChildren="自动更新"
            unCheckedChildren="手动更新"
          />
          <Button.Group>
            <Button 
              type="dashed" 
              size="large" 
              onClick={() => cancel()}
              icon={<StopOutlined />}
            >
              取消请求
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => fetchAllData(dataToShow)}
              icon={<SyncOutlined spin={!loading} />}
            >
              获取最新数据
            </Button>
          </Button.Group>
          <Button
            type="dashed"
            size="large"
            onClick={() => {
              reckoner?.({
                props: { title: '计算器' },
                closeForm: true,
              }).then(() => new Promise((resolve: any) => resolve()));
            }}
            icon={<CalculatorOutlined />}
          >
            计算器
          </Button>
          <Select
            showSearch
            placeholder="筛选票子"
            style={{ width: '200px' }}
            options={stocks.map((item: StockData, index: number) => ({
              label: `${Math.ceil((index + 1) / PAGE_SIZE_MAX)}/${item.name}(${item.code})`,
              value: `${item.code}_${item.price}_${index}`,
            }))}
            filterOption={(input: any, option: any) =>
              `${option?.label}_${option?.value}_${getFirstPinyinLetter(option?.label)}`
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Space>
      </motion.div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={0}>
          <motion.div 
            className="content-wrapper"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Skeleton loading={!loading} active>
              {dataSource.map((item, index) => {
                const safeItem = {
                  ...item,
                  code: item.code?.toString() || '',
                  exchange: item.exchange || '',
                };
                
                return (
                  <motion.div 
                    className="mobile-card"
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onDoubleClick={() => copyText(item as StockData)}
                  >
                    <div className="card-header">
                      <DetailPopover
                        text={`${safeItem.name} / ${safeItem.code} / 股价:${safeItem.price} / 收盘价:${safeItem.CNYPrice}`}
                        code={safeItem.code}
                        exchange={safeItem.exchange}
                        placement="top"
                      />
                    </div>
                    <Row gutter={[16, 16]}>
                      {LADDER.map((lItem, key) => (
                        <Col span={8} key={key}>
                          <Statistic
                            title={lItem}
                            value={formatPrice(item, lItem)}
                            precision={2}
                          />
                        </Col>
                      ))}
                    </Row>
                  </motion.div>
                );
              })}
            </Skeleton>
          </motion.div>
        </Col>
        
        <Col xs={24} md={24}>
          <motion.div 
            className="content-wrapper"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <TableRes />
          </motion.div>
        </Col>
      </Row>
      
      <Details {...detailProps} />
      <Reckoner {...reckonerProps} />
    </StyledApp>
  );
};

export default App;
