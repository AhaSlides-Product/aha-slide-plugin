import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import router from './router';
import { PresenterSlidePluginIframe } from '@aha/ui';

const app = createApp(App);
app.use(router)
app.use(Antd)

// Initialize PresenterSlidePluginIframe zoid component
if (PresenterSlidePluginIframe) {
  console.log('Zoid component initialized');
}

app.mount('#app')
