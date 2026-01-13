import { createRouter, createWebHistory } from 'vue-router'
import Canvas from '../pages/Canvas.vue'
import Settings from '../pages/Settings.vue'
import Audience from '../pages/Audience.vue'

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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
