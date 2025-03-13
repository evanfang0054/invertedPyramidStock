import React from 'react';
import pinyin from 'tiny-pinyin';

const calculatePercentageDifference = (oldValue: number, newValue: number) => {
  // const absoluteOldValue = Math.abs(oldValue);
  // const absoluteDifference = Math.abs(newValue - oldValue);

  // const percentageDifference = (absoluteDifference / absoluteOldValue) * 100;

  return newValue * 0.95 <= oldValue;
};

const formatPrice = (record: any, scale: number) => {
  const oldPrice = scalePrice(record.price, scale);
  // if (
  //   calculatePercentageDifference(oldPrice, record.CNYPrice) &&
  //   Number(oldPrice) > Number(record.CNYPrice)
  // ) {
  //   return (
  //     <div style={{ backgroundColor: 'rgb(255 172 172)' }}>{oldPrice}</div>
  //   );
  // }

  if (isScalePrice(record.CNYPrice, Number(oldPrice), scale)) {
    return <div style={{ backgroundColor: 'red' }}>{oldPrice}</div>;
  }

  return oldPrice;
};

const scalePrice = (price: number | string, scale: number) => {
  return (Number(price) * scale).toFixed(2);
};

const isScalePrice = (CNYPrice: number, oldPrice: number, scale: number) => {
  return (
    calculatePercentageDifference(oldPrice, CNYPrice) &&
    Number(oldPrice) <= Number(CNYPrice) &&
    ![0.875, 0.809, 0.79].includes(scale)
  );
};

const getFirstPinyinLetter = (chineseString: string) => {
  // 将中文字符串转换为拼音
  const nameArray = chineseString?.replace(/\([^)]*\)/, '')?.split('');
  const pinyinArray = nameArray.map(
    str => pinyin?.convertToPinyin(str, '', true)?.[0],
  );
  return pinyinArray.join('') || '';
};

export {
  calculatePercentageDifference,
  formatPrice,
  getFirstPinyinLetter,
  scalePrice,
  isScalePrice,
};
