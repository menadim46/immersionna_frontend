import { createApp } from 'vue'
import App from '@/App.vue'
import Home from '@/components/Home.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/aura-light-green/theme.css'
import VCalendar from 'v-calendar';
import 'v-calendar/style.css';
import { setupCalendar,DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import VDatePicker from 'v-calendar';
// Import our custom CSS
import '@/scss/styles.scss'
import { PrimeIcons } from 'primevue/api'
import 'primeicons/primeicons.css'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser,faListCheck ,faCalendarDays,faGlobe, faTrash} from '@fortawesome/free-solid-svg-icons'
import {  } from '@fortawesome/free-brands-svg-icons'
import ListaServicios from './components/ListaServicios.vue'
import ListaReservas from './components/ListaReservas.vue'

library.add(faUser,faListCheck,faCalendarDays)

const pinia = createPinia()

const NotFound = () => import('@/components/NotFound.vue')
const listaServicios = () => import('@/components/ListaServicios.vue')
const listaReservas = () => import('@/components/ListaReservas.vue')




const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/listaServicios', component: ListaServicios, name: 'listaServicios' },
    { path: '/listaReservas', component: ListaReservas, name: 'listaReservas' },
    { path: '/:pathMatch(.*)', component: NotFound, name: 'notfound' }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})



const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(PrimeVue)
app.use(router)
app.use(pinia)
app.component('VDatePicker', DatePicker)
app.use(setupCalendar, {})
app.mount('#app')

