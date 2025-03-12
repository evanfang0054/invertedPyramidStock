import { Button, Drawer, ModalProps } from 'antd';
import React, { useState } from 'react';

const App = (props: ModalProps & any) => {
  return (
    <Drawer
      width={760}
      open={props.visible}
      title={props.title}
      onClose={props?.onCancel}
    >
      {/* emchartk */}
      <img
        src={`https://image.sinajs.cn/newchart/daily/n/${props?.record?.exchange?.toLocaleLowerCase()}${
          props?.record?.code
        }.gif`}
        width='100%'
      />
      {/* <iframe id='myIframe' src={`http://quote.eastmoney.com/${props?.record?.code}.html#fullScreenChart`} width='100%' height={'100%'}/> */}
    </Drawer>
  );
};

export default App;
