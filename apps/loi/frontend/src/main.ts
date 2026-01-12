import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import router from './router';
import { SlidePluginIframe } from '@aha/ui';

if (import.meta.env.VITE_AHA_MOCK_FRAME) {
  const { initDev } = await import('@aha/dev');
  initDev();
}

const app = createApp(App);
app.use(router)
app.use(Antd)

// Initialize SlidePluginIframe zoid component
if (SlidePluginIframe) {
  console.log('Zoid component initialized');
}

app.mount('#app')
