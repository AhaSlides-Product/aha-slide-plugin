import { createRouter, createWebHistory } from 'vue-router'
import Canvas from '../pages/Canvas.vue'
import Presenting from '../pages/Presenting.vue'
import Settings from '../pages/Settings.vue'

const routes = [
    {
        path: '/',
        redirect: `/canvas/${import.meta.env.VITE_AHA_DEFAULT_SLIDE}`
    },
    {
        path: '/canvas/:slideId',
        name: 'Canvas',
        component: Canvas
    },
    {
        path: '/presenting/:slideId',
        name: 'Presenting',
        component: Presenting
    },
    {
        path: '/settings/:slideId',
        name: 'Settings',
        component: Settings
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
