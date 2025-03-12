import React, { useState } from 'react';
import {
  Drawer,
  ModalProps,
  Descriptions,
  message,
  InputNumber,
  Form,
  Typography,
  Card,
  Space,
  Statistic
} from 'antd';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { CalculatorOutlined, CopyOutlined } from '@ant-design/icons';
import { LADDER } from '@/common/enum';
import { scalePrice } from '@/common/util';

const StyledContent = styled.div`
  .calculator-header {
    margin-bottom: 24px;
    text-align: center;
  }

  .input-section {
    max-width: 300px;
    margin: 0 auto 32px;
  }

  .result-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  }

  .copy-hint {
    text-align: center;
    color: #666;
    margin-top: 16px;
  }
`;

const App: React.FC<ModalProps & any> = (props) => {
  const [price, setPrice] = useState<number>(0);

  const copyText = (price: number) => {
    try {
      const sPrice = LADDER.map(s => `${s} 👉 ${scalePrice(price, s)}`);
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = sPrice.filter(Boolean).join('\n');
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);
      message.success({
        content: '复制成功',
        icon: <CopyOutlined />,
      });
    } catch (error) {
      message.error('复制失败，请重试');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Drawer
      width={760}
      placement="bottom"
      open={props.visible}
      title={
        <Space>
          <CalculatorOutlined />
          <span>{props.title}</span>
        </Space>
      }
      onClose={props?.onCancel}
      height="70%"
    >
      <StyledContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="calculator-header">
            <Typography.Title level={4}>
              股价计算器
            </Typography.Title>
            <Typography.Text type="secondary">
              输入股价，快速计算不同比例的价格
            </Typography.Text>
          </div>

          <motion.div variants={itemVariants} className="input-section">
            <Form layout="vertical">
              <Form.Item label="输入股价">
                <InputNumber
                  value={price}
                  onChange={value => setPrice(value as number)}
                  style={{ width: '100%' }}
                  size="large"
                  prefix="¥"
                  placeholder="请输入股价"
                />
              </Form.Item>
            </Form>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="result-card"
              onClick={() => copyText(price)}
              hoverable
            >
              <Descriptions 
                title={
                  <Space>
                    <span>计算结果</span>
                    <Typography.Text type="secondary">
                      (点击卡片复制结果)
                    </Typography.Text>
                  </Space>
                }
                column={{ xs: 1, sm: 2, md: 3 }}
              >
                {LADDER.map((lItem, key) => (
                  <Descriptions.Item key={key}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Statistic
                        title={lItem}
                        value={scalePrice(price, lItem)}
                        precision={2}
                        prefix="¥"
                      />
                    </motion.div>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="copy-hint"
          >
            <Typography.Text type="secondary">
              点击卡片即可复制所有结果
            </Typography.Text>
          </motion.div>
        </motion.div>
      </StyledContent>
    </Drawer>
  );
};

export default App;
