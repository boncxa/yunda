/*
 * @Description: 与父窗口通信的hook
 * @Author: WangYuan
 * @Date: 2024-11-27
 */
import mitt from 'mitt';

const emitter = mitt();

export const useParentBus = () => {
  const parentBus = {
    on: (event: string, callback: Function) => {
      emitter.on(event, callback as any);
      window.addEventListener('message', (e) => {
        if (e.data.event === event) {
          callback(e.data.data);
        }
      });
    },
    emit: (event: string, data: any) => {
      emitter.emit(event, data);
      window.parent.postMessage({ event, data }, '*');
    },
    off: (event: string, callback?: Function) => {
      emitter.off(event, callback as any);
      // Note: We can't remove specific message event listeners
    }
  };

  return {
    parentBus
  };
};
