import { createRouter, createWebHistory } from 'vue-router'
import Canvas from '../pages/Canvas.vue'
import Settings from '../pages/Settings.vue'
import Audience from '../pages/Audience.vue'
import AudienceModal from '../pages/AudienceModal.vue'
import CanvasModal from '../pages/CanvasModal.vue'
import ComponentsShowcase from '../pages/AntDesignComponentsShowcase.vue'
import IconsShowcase from '../pages/IconsShowcase.vue'

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
        path: '/:type/audience-modal/:slideId',
        name: 'AudienceModal',
        component: AudienceModal
    },
    {
        path: '/:type/:slideId/canvas-modal',
        name: 'CanvasModal',
        component: CanvasModal
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
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
