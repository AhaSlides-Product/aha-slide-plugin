import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import '@aha/ui/ahaslides-vars.css' // must import this to use variables
import './style.css'
import App from './App.vue'
import router from './router';
import { PresenterSlidePluginIframe, AudienceSlidePluginIframe } from '@aha/ui';
import AhaIcon from '@aha/ui/AhaIcon.vue';

const app = createApp(App);
app.use(router)
app.use(Antd)

// Register global icon component
app.component('AhaIcon', AhaIcon)

// Initialize Zoid components
if (PresenterSlidePluginIframe) {
  console.log('PresenterSlidePluginIframe initialized');
}
if (AudienceSlidePluginIframe) {
  console.log('AudienceSlidePluginIframe initialized');
}

app.mount('#app')
