<!--
 * @Description: 渲染器主页面
 * @Author: WangYuan
 * @Date: 2024-11-27
-->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '渲染器',
  },
}
</route>
<template>
  <div class="render-container">
    <div
      class="render-content"
      @dragover.prevent
      @click="handleClick"
      @contextmenu="handleContextMenu"
    >
      <div
        v-for="(widget, index) in widgetList"
        :key="widget.id"
        class="widget-container"
        draggable="true"
        :class="{
          'widget-selected': currentWidget?.id === widget.id,
          'widget-dragging': dragState.dragging && dragState.sourceIndex === index,
          'widget-drag-target': dragState.dragging && dragState.targetIndex === index,
        }"
        :data-widget-id="widget.id"
        :data-widget-index="index"
        @dragstart="handleWidgetDragStart($event, index)"
        @dragend="handleWidgetDragEnd"
        @dragenter="handleWidgetDragEnter(index)"
        @drop="handleWidgetDrop"
      >
        <component :is="widget.componentName" v-bind="widget.props || {}" />
      </div>
      <pre style="margin-top: 20px; font-size: 12px">{{ widgetList }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useParentBus } from '@/hooks/useParentBus'
import { cloneDeep } from '@design/utils'

const widgetList = ref([])
const currentWidget = ref(null)
const dragComponent = ref(null)
const dragState = ref({
  dragging: false,
  sourceIndex: -1,
  targetIndex: -1,
})

const { parentBus } = useParentBus()

// 监听父窗口发来的组件列表更新
parentBus.on('watchWidgetList', (data) => {
  console.log('Received widget list from parent:', data)
  if (Array.isArray(data)) {
    widgetList.value = data
  }
})

// 监听设计器发来的新组件
parentBus.on('dragstart', (component) => {
  console.log('Received dragstart from designer:', component)
  dragComponent.value = component
})

// 监听设计器发来的拖动结束事件
parentBus.on('dragend', () => {
  console.log('Received dragend from designer')
  if (dragComponent.value) {
    try {
      // 创建组件的props
      const props = {}
      if (Array.isArray(dragComponent.value.props)) {
        dragComponent.value.props.forEach((prop) => {
          props[prop.name] = cloneDeep(prop.defaultValue)
        })
      }

      // 创建新组件实例
      const newWidget = {
        id: Date.now().toString(),
        componentName: dragComponent.value.componentName,
        title: dragComponent.value.title,
        props,
        configure: dragComponent.value.configure || {},
        group: dragComponent.value.group,
        sortWeight: dragComponent.value.sortWeight,
        cover: dragComponent.value.cover,
      }

      console.log('Adding new widget:', newWidget)
      // 更新组件列表并触发同步
      const newList = [...widgetList.value, newWidget]
      widgetList.value = newList
      parentBus.emit('syncWidgetList', cloneDeep(newList))
    } catch (error) {
      console.error('Error adding widget:', error)
    }
  }
  dragComponent.value = null
})

// 处理组件选中
const handleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const widgetId = target.closest('[data-widget-id]')?.getAttribute('data-widget-id')

  if (widgetId) {
    currentWidget.value = widgetList.value.find((w) => w.id === widgetId) || null
    parentBus.emit('setCurrentWidget', currentWidget.value)
  }
}

// 处理右键菜单
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault()
  const target = e.target as HTMLElement
  const widgetId = target.closest('[data-widget-id]')?.getAttribute('data-widget-id')

  if (widgetId) {
    currentWidget.value = widgetList.value.find((w) => w.id === widgetId) || null
    parentBus.emit('contextmenu', {
      show: true,
      x: e.offsetX,
      y: e.offsetY,
      widgetId,
    })
  }
}

// 处理组件拖动开始
const handleWidgetDragStart = (e: DragEvent, index: number) => {
  dragState.value.dragging = true
  dragState.value.sourceIndex = index
  e.dataTransfer?.setData('text/plain', '') // 必须调用setData
}

// 处理组件拖动结束
const handleWidgetDragEnd = () => {
  dragState.value.dragging = false
  dragState.value.sourceIndex = -1
  dragState.value.targetIndex = -1
}

// 处理组件拖动进入
const handleWidgetDragEnter = (index: number) => {
  if (dragState.value.dragging && dragState.value.sourceIndex !== index) {
    dragState.value.targetIndex = index
  }
}

// 处理组件放置
const handleWidgetDrop = () => {
  if (dragState.value.sourceIndex > -1 && dragState.value.targetIndex > -1) {
    const newList = [...widgetList.value]
    const [movedItem] = newList.splice(dragState.value.sourceIndex, 1)
    newList.splice(dragState.value.targetIndex, 0, movedItem)
    widgetList.value = newList
    parentBus.emit('syncWidgetList', cloneDeep(newList))
  }
  handleWidgetDragEnd()
}

onMounted(() => {
  // 初始化时同步组件列表
  parentBus.emit('syncWidgetList', [])
})
</script>

<style scoped>
.render-container {
  position: relative;
  height: 100%;
  overflow: auto;
  background: #f5f5f5;
}

.render-content {
  box-sizing: border-box;
  min-height: 100%;
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.widget-container {
  position: relative;
  padding: 4px;
  margin: 4px 0;
  cursor: move;
  border: 1px dashed transparent;
  transition: all 0.2s;
}

.widget-container:hover {
  border-color: #2254f4;
}

.widget-selected {
  outline: 2px solid #2254f4;
}

.widget-dragging {
  border: 1px dashed #2254f4;
  opacity: 0.5;
}

.widget-drag-target {
  padding: 8px;
  margin: 8px 0;
  border: 2px dashed #2254f4;
}

:deep(.render-content > *) {
  border: 1px dashed #ddd;
}
</style>
