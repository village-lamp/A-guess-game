import { createRouter, createWebHistory } from 'vue-router'
import Guess from '../src/conponents/Guess.vue'
import Home from '../src/conponents/Home.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/guess/:type',
        name: 'Guess',
        component: Guess,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router