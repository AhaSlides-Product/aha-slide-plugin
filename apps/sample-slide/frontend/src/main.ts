import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import '@aha/ui/antd-vars.css'
import App from './App.vue'
import router from './router';
import { PresenterSlidePluginIframe, AudienceSlidePluginIframe } from '@aha/ui';

const app = createApp(App);
app.use(router)
app.use(Antd)

// Initialize Zoid components
if (PresenterSlidePluginIframe) {
  console.log('PresenterSlidePluginIframe initialized');
}
if (AudienceSlidePluginIframe) {
  console.log('AudienceSlidePluginIframe initialized');
}

app.mount('#app')
