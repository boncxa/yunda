/*
 * @Description: 与父窗口通信的hook
 * @Author: WangYuan
 * @Date: 2024-11-27
 */
import mitt from 'mitt'

const emitter = mitt()

export const useParentBus = () => {
  const parentBus = {
    on: (event: string, callback: Function) => {
      emitter.on(event, callback as any)
      window.addEventListener('message', (e) => {
        if (e.data.event === event) {
          callback(e.data.params)
        }
      })
    },
    emit: (event: string, params: any) => {
      emitter.emit(event, params)
      window.parent.postMessage({ event, params }, '*')
    },
    off: (event: string, callback?: Function) => {
      emitter.off(event, callback as any)
    },
  }

  return {
    parentBus,
  }
}
