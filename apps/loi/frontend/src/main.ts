import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import router from './router';
import { SlidePluginIframe } from '@aha/ui';

const app = createApp(App);
app.use(router)
app.use(Antd)

// Initialize SlidePluginIframe zoid component
if (SlidePluginIframe) {
  console.log('Zoid component initialized');
}

app.mount('#app')
