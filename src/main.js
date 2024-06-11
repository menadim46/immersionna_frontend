import { createApp } from 'vue'
import App from '@/App.vue'
import Home from '@/components/Home.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import { setupCalendar, DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import VDatePicker from 'v-calendar';
import '@/scss/styles.scss'
import { PrimeIcons } from 'primevue/api'
import 'primeicons/primeicons.css'

import * as bootstrap from 'bootstrap'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faListCheck, faCalendarDays, faGlobe, faTrash } from '@fortawesome/free-solid-svg-icons'
import { } from '@fortawesome/free-brands-svg-icons'
import ListaServicios from '@/components/ListaServicios.vue'
import ListaReservas from '@/components/ListaReservas.vue'
import Informes from '@/components/Informes.vue'
import Consultas from '@/components/Consultas.vue'
import Clientes from '@/components/Clientes.vue'

library.add(faUser, faListCheck, faCalendarDays)

const pinia = createPinia()

const NotFound = () => import('@/components/NotFound.vue')
const listaServicios = () => import('@/components/ListaServicios.vue')
const listaReservas = () => import('@/components/ListaReservas.vue')
const informes = () => import('@/components/Informes.vue')
const consultas = () => import('@/components/Consultas.vue')
const clientes = () => import ('@/components/Clientes.vue')

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/listaServicios', component: ListaServicios, name: 'listaServicios' },
    { path: '/listaReservas', component: ListaReservas, name: 'listaReservas' },
    { path: '/informes', component: Informes, name: 'informes' },
    { path: '/consultas', component: Consultas, name: 'consultas' },
    { path: '/clientes', component: Clientes, name: 'clientes' },
    { path: '/:pathMatch(.*)', component: NotFound, name: 'notfound' }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(PrimeVue)
app.use(router)
app.use(pinia)
app.component('VDatePicker', DatePicker)
app.use(setupCalendar, {})
app.mount('#app')


