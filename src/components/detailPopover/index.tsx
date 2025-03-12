import React from 'react';
import { Popover, PopoverProps } from 'antd';

type DetailPopover = {
  exchange: string;
  code: string;
  text: React.ReactNode;
} & Pick<PopoverProps, 'placement'>;

const Index = (props: DetailPopover) => {
  return (
    <Popover
      content={
        <img
          src={`https://image.sinajs.cn/newchart/daily/n/${props?.exchange?.toLocaleLowerCase()}${
            props?.code
          }.gif`}
          width='100%'
        />
      }
      trigger='hover'
      placement={props?.placement || 'right'}
    >
      {props.text}
    </Popover>
  );
};

export default Index;
