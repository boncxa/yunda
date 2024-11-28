<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: 'demo',
  },
}
</route>

<template>
  <view class="">
    <wd-swiper
      :list="swiperList"
      autoplay
      v-model:current="current"
      @click="handleClick"
      @change="onChange"
    ></wd-swiper>
  </view>
</template>

<script lang="ts" setup>
const current = ref<number>(0)

const swiperList = ref([
  'https://registry.npmmirror.com/wot-design-uni-assets/*/files/redpanda.jpg',
  'https://registry.npmmirror.com/wot-design-uni-assets/*/files/capybara.jpg',
  'https://registry.npmmirror.com/wot-design-uni-assets/*/files/panda.jpg',
  'https://registry.npmmirror.com/wot-design-uni-assets/*/files/moon.jpg',
  'https://registry.npmmirror.com/wot-design-uni-assets/*/files/meng.jpg',
])
function handleClick(e) {
  console.log(e)
}
function onChange(e) {
  console.log(e)
}
</script>

<style lang="scss" scoped>
//
</style>
