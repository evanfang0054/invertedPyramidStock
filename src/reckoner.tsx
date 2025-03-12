import {
  Drawer,
  ModalProps,
  Descriptions,
  message,
  InputNumber,
  Row,
  Form
} from 'antd';
import React, { useState } from 'react';
import { LADDER } from '@/common/enum';
import { scalePrice } from '@/common/util';

const App = (props: ModalProps & any) => {
  const [price, setPrice] = useState<number>(0);
  const copyText = (price: number) => {
    // 创建一个虚拟的 textarea 元素，将文本复制到其中
    let isSPrice = false;
    const sPrice = LADDER.map(s => {
      return `${s} 👉 ${scalePrice(price, s)}`;
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
    <Drawer
      width={760}
      placement="bottom"
      open={props.visible}
      title={props.title}
      onClose={props?.onCancel}
      height={'70%'}
    >
      <Form>
        <Form.Item>
          <InputNumber
            value={price}
            onChange={value => setPrice(value as number)}
          />
        </Form.Item>
      </Form>
      <Row>
        <div onDoubleClick={() => copyText(price)}>
          <Descriptions title={'计算结果'} column={3}>
            {LADDER.map((lItem, key) => {
              return (
                <Descriptions.Item label={lItem} key={key}>
                  {scalePrice(price, lItem)}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        </div>
      </Row>
    </Drawer>
  );
};

export default App;
