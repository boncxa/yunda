/*
 * @Description: What's this for
 * @Autor: WangYuan1
 * @Date: 2023-02-08 11:38:01
 * @LastEditors: WangYuan
 * @LastEditTime: 2024-05-22 10:17:36
 */
import type { App } from "vue";

function registeredSetter(app: App) {
  const modules: any = import.meta.glob("@/setter/**/index.vue", { eager: true });

  for (const path in modules) {
    const regex = /\/([^/]+)\/index\.vue$/;
    const match = path.match(regex);

    if (match) {
      const name = match[1];
      app.component(name, modules[path].default);
    }
  }
}

export { registeredSetter };

