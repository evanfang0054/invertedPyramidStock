import React from 'react'
import ReactDOM from 'react-dom/client'
import { Modal } from 'antd'
import App from './App'
import { createVersionChecker } from 'version-sentinel'

const checker = createVersionChecker({
  checkInterval: 30000,
  versionUrl: '/invertedPyramidStock',
  compareStrategy: 'etag'
})

checker.on('update', () => {
  Modal.confirm({
    title: '发现新版本',
    content: '请点击确定按钮更新',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      window.location.reload(); // 用户确认后重新加载页面
    },
  });
});



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
