import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/pages/build/index',
    component: () => import('../pages/build/index.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
