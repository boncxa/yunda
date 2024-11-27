<!--
 * @Description: 渲染器主页面
 * @Author: WangYuan
 * @Date: 2024-11-27
-->
<template>
  <div class="render-container">
    <div>渲染器主页面</div>
    <div
      class="render-content"
      @dragover.prevent
      @drop="handleDrop"
      @click="handleClick"
      @contextmenu.prevent="handleContextMenu"
    >
      <template v-for="(widget, index) in widgetList" :key="widget.id">
        <component
          :is="widget.componentName"
          v-bind="widget.props"
          :class="{ 'widget-selected': currentWidget?.id === widget.id }"
          :style="getWidgetStyle(widget)"
          draggable="true"
          @dragstart="(e) => handleDragStart(e, widget, index)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @drop="(e) => handleWidgetDrop(e, index)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, getCurrentInstance } from 'vue';
import { registeredWidget } from '@design/widget';
import { useParentBus } from '@/hooks/useParentBus';

const widgetList = ref([]);
const currentWidget = ref(null);
const dragWidget = ref(null);
const dragIndex = ref(-1);

const { parentBus } = useParentBus();
const app = getCurrentInstance()?.appContext.app;

// 监听父窗口发来的组件列表更新
watch(() => widgetList.value, (newVal) => {
  parentBus.emit('syncWidgetList', newVal);
}, { deep: true });

// 处理组件拖拽开始
const handleDragStart = (e: DragEvent, widget: any, index: number) => {
  dragWidget.value = widget;
  dragIndex.value = index;
  e.dataTransfer.effectAllowed = 'move';
};

// 处理组件拖拽结束
const handleDragEnd = () => {
  dragWidget.value = null;
  dragIndex.value = -1;
};

// 处理新组件拖入
const handleDrop = (e: DragEvent) => {
  const componentData = e.dataTransfer?.getData('component');
  if (componentData) {
    const component = JSON.parse(componentData);
    const newWidget = {
      ...component,
      id: Date.now().toString(),
    };
    widgetList.value.push(newWidget);
  }
};

// 处理组件位置交换
const handleWidgetDrop = (e: DragEvent, targetIndex: number) => {
  e.stopPropagation();
  if (dragIndex.value === -1) return;
  
  const list = [...widgetList.value];
  const [removed] = list.splice(dragIndex.value, 1);
  list.splice(targetIndex, 0, removed);
  widgetList.value = list;
};

// 处理组件选中
const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const widgetId = target.getAttribute('data-widget-id');
  if (widgetId) {
    const widget = widgetList.value.find(w => w.id === widgetId);
    currentWidget.value = widget;
    parentBus.emit('setCurrentWidget', widget);
  }
};

// 处理右键菜单
const handleContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const widgetId = target.getAttribute('data-widget-id');
  if (widgetId) {
    parentBus.emit('contextmenu', {
      show: true,
      x: e.clientX,
      y: e.clientY,
      widgetId
    });
  }
};

// 获取组件样式
const getWidgetStyle = (widget: any) => {
  return {
    position: 'relative',
    cursor: 'move',
    'user-select': 'none'
  };
};

// 监听父窗口发来的组件列表更新
parentBus.on('watchWidgetList', (data) => {
  widgetList.value = data;
});

onMounted(() => {
  if (app) {
    // 注册所有组件
    try {
      Object.keys(registeredWidget).forEach((key) => {
        const component = registeredWidget[key];
        if (component) {
          app.component(key, component);
        }
      });
    } catch (error) {
      console.warn('Failed to load widgets:', error);
    }
  }
});
</script>

<style scoped>
.render-container {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.render-content {
  min-height: 100%;
  background: #fff;
}

.widget-selected {
  outline: 2px solid #2254f4;
}
</style>
