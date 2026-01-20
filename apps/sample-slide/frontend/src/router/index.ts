import { createRouter, createWebHistory } from 'vue-router'
import Canvas from '../pages/Canvas.vue'
import Settings from '../pages/Settings.vue'
import Audience from '../pages/Audience.vue'
import ComponentsShowcase from '../pages/AntDesignComponentsShowcase.vue'
import IconsShowcase from '../pages/IconsShowcase.vue'
import IconsShowcaseV2 from '../pages/IconsShowcaseV2.vue'

const routes = [
    {
        path: '/',
        redirect: `/canvas/${import.meta.env.VITE_AHA_DEFAULT_SLIDE}`
    },
    {
        path: '/:type/canvas/:slideId',
        name: 'Canvas',
        component: Canvas
    },
    {
        path: '/:type/settings/:slideId',
        name: 'Settings',
        component: Settings
    },
    {
        path: '/:type/audience/:slideId',
        name: 'Audience',
        component: Audience
    },
    {
        path: '/components',
        name: 'ComponentsShowcase',
        component: ComponentsShowcase
    },
    {
        path: '/icons',
        name: 'IconsShowcase',
        component: IconsShowcase
    },
    {
        path: '/icons-v2',
        name: 'IconsShowcaseV2',
        component: IconsShowcaseV2
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
