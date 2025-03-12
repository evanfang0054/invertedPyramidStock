import { ModalProps } from 'antd/lib/modal'
import { FormInstance } from 'antd/lib/form'
import { Form, Modal } from 'antd'
import { useState, useRef } from 'react'
import { PromiseLikeCollection } from '@/models/constructor'

type Props = {
  [key: string]: any
}

type ModalTemplateHook = Pick<ModalProps, 'visible' | 'onOk' | 'onCancel' | 'confirmLoading'> & {
  form: FormInstance;
  /**
   * @method open - 可选传参，激活组件，链式调用是接submit输出而不是激活后
   * */
  open(option?: {
    props?: Partial<ModalProps> & Props;
    record?: object;
    closeForm?: boolean,
    useConfirmText?: string,
  }): Pick<PromiseLikeCollection, 'then' | 'catch' | 'cancel' | 'finally'>;
}

const pretreated = <T = any>(stack: PromiseLikeCollection['queue'], promise: Promise<T> | void) => stack.reduce(
  // @ts-ignore
  (pre, cur) => pre[cur.type](cur.callback),
  promise,
)

function useModalTemplate(): ModalTemplateHook {
  const [form] = Form.useForm()
  const [visible, toggle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [useCloseForm, updateCloseForm] = useState(false)
  const [useConfirmText, updateConfirmText] = useState('')
  const [extraProps, updateExtra] = useState<any>({})
  const collection = useRef<PromiseLikeCollection>(new PromiseLikeCollection()).current
  const open: ModalTemplateHook['open'] = option => {
    toggle(true)
    if (option?.closeForm) {
      updateCloseForm(option.closeForm)
    } else {
      if (option?.record) {
        form.setFieldsValue(option.record)
      } else {
        form.resetFields()
      }
    }
    
    // 是否需要二次确认
    if (option?.useConfirmText) {
      updateConfirmText(option.useConfirmText)
    }
    if (option?.props) {
      updateExtra(option.props)
    }
    collection.reset()
    return collection
  }

  const initUseModalInfo = () => {
    setLoading(false)
    updateCloseForm(false)
    updateConfirmText('')
    toggle(false)
    updateExtra({})
    if (!useCloseForm) {
      form.resetFields()
    }
  }

  const cancel = () => {
    setLoading(false)
    const queue: any = collection.get()
    if (useConfirmText) {
      Modal.confirm({
        title: '温馨提示',
        content: useConfirmText,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          queue.find((action: any) => action.type === 'cancel')?.callback?.()
          initUseModalInfo()
        }
      });
    } else {
      queue.find((action: any) => action.type === 'cancel')?.callback?.()
      initUseModalInfo()
    }
  }

  const submit = () => {
    setLoading(true)
    const promise = form.validateFields()
    promise.catch(() => setLoading(false))
    // 在finally前插入内部操作回调
    let queue = collection.get()
    queue = queue.filter(action => action.type !== 'cancel')
    const finalIndex = queue.findIndex(action => action.type === 'finally')
    queue.splice(
      finalIndex === -1 ? queue.length : finalIndex,
      0,
      { type: 'then', callback: initUseModalInfo },
      { type: 'catch', callback: () => {
        setLoading(false)
      }},
    )
    return pretreated(queue, promise)
  }

  return {
    ...extraProps,
    visible,
    ...(useCloseForm ? {} : { form }),
    open,
    onOk: submit,
    onCancel: cancel,
    confirmLoading: loading,
    setConfirmLoading: setLoading
  }
}

export default useModalTemplate
