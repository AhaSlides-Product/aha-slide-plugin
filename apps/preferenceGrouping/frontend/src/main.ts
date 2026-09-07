import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import '@aha/ui/ahaslides-vars.css' // must import this to use theme variables
import './style.css'
import '@aha/ui/ahaslides-antd-extensions.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { PresenterSlidePluginIframe, AudienceSlidePluginIframe, emitActionPlugin } from '@aha/ui'

const app = createApp(App)
app.use(router)
app.use(i18n)
app.use(Antd)
app.use(emitActionPlugin)

// Touch the zoid components so their side-effectful registration is retained.
if (PresenterSlidePluginIframe) console.log('PresenterSlidePluginIframe initialized')
if (AudienceSlidePluginIframe) console.log('AudienceSlidePluginIframe initialized')

app.mount('#app')
