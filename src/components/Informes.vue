<script>
import { mapActions, mapState } from 'pinia'
import { useReservasAPIStore } from '@/stores/reservasAPI'
import { useClientesAPIStore } from '@/stores/clientesAPI'
import { useServiciosAPIStore } from '@/stores/serviciosAPI'
import ListaServicios from '@/components/ListaServicios.vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'


export default {
    components: { DataTable, Column, Dropdown, Button, ListaServicios },
    data() {
        return {
            usernameSeleccionado: null,
            reservasTodas: [],
            reservaActualizar: '',
            usuarioParaFiltrar: '',
            contrasenaRegistrada: '',
            usuarioRegistrado: '',
            servicioConsultado: null,
            reservasConsulta: []
        }
    },
    computed: {
        ...mapState(useReservasAPIStore, ['reservasAPI', 'usuarios', 'tareas', 'usuarioSeleccionado', 'obtenerFecha']),
        ...mapState(useServiciosAPIStore, ['servicios', 'servicioConsultar', 'reservasServicioConsultado']),

        reservasFiltradasServicioSeleccionado() {
            let servicioComparar = this.servicioConsultar._links.self.href;
            servicioComparar = servicioComparar.replace('serviciosIntercambio', 'servicios')
                .replace('serviciosInmersion', 'servicios');
            const reservasFiltradas = this.reservasAPI.filter(reserva => {
                const hrefReservaNormalizado = reserva.servicio._links.self.href.replace('serviciosIntercambio', 'servicios')
                    .replace('serviciosInmersion', 'servicios');
                return hrefReservaNormalizado === servicioComparar;
            })
            return reservasFiltradas;
        },
        reservasConfirmadasViajar() {
            const indexPreparado = this.tareas.findIndex(tarea => tarea === 'Preparado para Viajar');
            if (indexPreparado === -1) {
                return [];
            }
            return this.reservasFiltradasServicioSeleccionado.filter(reserva => {
                const indexTareaAsignada = this.tareas.findIndex(tarea => tarea === reserva.tareaAsignada);
                return indexTareaAsignada >= indexPreparado;
            })
        },

        reservasNoConfirmadasViajar() {
            const indexPreparado = this.tareas.findIndex(tarea => tarea === 'Preparado para Viajar');
            if (indexPreparado === -1) {
                return [];
            }
            return this.reservasFiltradasServicioSeleccionado.filter(reserva => {
                const indexTareaAsignada = this.tareas.findIndex(tarea => tarea === reserva.tareaAsignada);
                return indexTareaAsignada < indexPreparado;
            })
        },

    },
    watch: {

        reservasAPI: 'ordenarReservas',
    },

    methods: {
        ...mapActions(useReservasAPIStore, ['cargarReservasAPI', 'asignarUsuarioStore', 'actualizarReserva', 'completarTareaStore']),
        ...mapActions(useClientesAPIStore, ['cargarClienteAPI']),
        ...mapActions(useServiciosAPIStore, ['cargarServiciosAPI', 'consultar', 'consultarReservasServicio', 'cargarReservasTodosServicios']),
        diasRestantes(fechaInicio) {
            const hoy = new Date();
            const fechaServicio = new Date(fechaInicio);
            const diferenciaMilisegundos = fechaServicio - hoy;
            const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 3600 * 24));
            return diasRestantes;
        }
    },

    mounted() {
        this.cargarReservasAPI()
        this.cargarClienteAPI()
    }

}
</script>


<template>


    <div class="container mt-3">
        <router-link to="/listaServicios"> <button type="button" class="btn btn-success " style="font-size: 1.5em;">
                <h4><i class="pi pi-arrow-circle-left" style="font-size: 1em;"></i> Volver</h4>
            </button> </router-link>
    </div>
    <div v-if="servicioConsultar" class="container">
        <div class="container text-center">
            <div class="row justify-content-end">
                <div class="col-12">
                    <div class="card mb-5 mt-3 text-center">

                        <h3 style="color:#003366; font-weight: 600;"> Servicio de <span
                                v-if="this.servicioConsultar.tipoAlojamiento">&nbsp;Inmersión </span> <span
                                v-else="this.servicioConsultar.nivelEstudios">&nbsp; Intercambio </span>&nbsp;en {{
                                    this.servicioConsultar.descripcion }} </h3>
                        <h5 style="color:#003366; font-weight: 600;" class="mt-2">

                            {{ new Date(this.servicioConsultar.fechaInicio).toLocaleDateString() }} - {{
                                new Date(this.servicioConsultar.fechaFin).toLocaleDateString() }}
                        </h5>
                        <h5 style="color:#003366; font-weight: 600;">
                            {{ this.servicioConsultar.idioma }}
                        </h5>

                        <h5 v-if="this.servicioConsultar.disponibilidad == true">
                            <strong style="color: green">Plazas Disponibles {{
                                this.servicioConsultar.numeroAlumnos - this.servicioConsultar.reservas.length
                                }}</strong>
                        </h5>
                        <h5 v-else>
                            <strong style="color: red;">Cerrado</strong>
                        </h5>
                        <h5 style="color:#003366; font-weight: 600;" v-if="this.servicioConsultar.tipoAlojamiento">
                            {{ this.servicioConsultar.tipoAlojamiento }}
                        </h5>
                        <h5 style="color:#003366; font-weight: 600;" v-if="this.servicioConsultar.nivelEstudios">
                            {{ this.servicioConsultar.nivelEstudios }}
                        </h5>
                        <h6 style="color: red;font-weight: 600;">Quedan {{
                            diasRestantes(this.servicioConsultar.fechaInicio) }} dias</h6>

                        <h4 class="mt-3" style="color:#003366; font-weight: 600;">Confirmados para viajar ({{
                            this.reservasConfirmadasViajar.length }})</h4>
                        <DataTable :value="this.reservasConfirmadasViajar" resizableColumns columnResizeMode="fit"
                            paginator :rows="50" stripedRows tableStyle="min-width: 30vw">
                            <Column field="estado" header="Estado" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.tareaAsignada }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="nombreApellidos" header="Nombre Completo" style="min-width: 3vw"
                                class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.nombreApellidosCliente }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="correo" header="Correo" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        <a :href="'mailto:' + data.correo">{{ data.correo }}</a>
                                    </div>
                                </template>
                            </Column>
                            <Column field="telefono" header="Telefono" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.telefono }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="dni" header="DNI" style="min-width: 3vw" class="fs-5 text-center">
                                <template #body="{ data }" class="align-items-center">
                                    <div class="text-center">
                                        {{ data.dni }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="pasaporte" header="Pasaporte" style="min-width: 3vw"
                                class="fs-5 text-center">
                                <template #body="{ data }" class="align-items-center">
                                    <div class="text-center" v-if="data.numeroPasaporte">
                                        <i class="pi pi-check"></i>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                        <h4 class="mt-3" style="color:#003366; font-weight: 600;">No Confirmados ({{
                            this.reservasNoConfirmadasViajar.length }})</h4>
                        <DataTable :value="this.reservasNoConfirmadasViajar" resizableColumns columnResizeMode="fit"
                            paginator :rows="50" stripedRows tableStyle="min-width: 30vw">
                            <Column field="estado" header="Estado" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.tareaAsignada }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="nombreApellidos" header="Nombre Completo" style="min-width: 3vw"
                                class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.nombreApellidosCliente }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="correo" header="Correo" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        <a :href="'mailto:' + data.correo">{{ data.correo }}</a>
                                    </div>
                                </template>
                            </Column>
                            <Column field="telefono" header="Telefono" style="min-width: 3vw" class="fs-5 ">
                                <template #body="{ data }">
                                    <div>
                                        {{ data.telefono }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="dni" header="DNI" style="min-width: 3vw" class="fs-5 text-center">
                                <template #body="{ data }" class="align-items-center">
                                    <div class="text-center">
                                        {{ data.dni }}
                                    </div>
                                </template>
                            </Column>
                            <Column field="pasaporte" header="Pasaporte" style="min-width: 3vw"
                                class="fs-5 text-center">
                                <template #body="{ data }" class="align-items-center">
                                    <div class="text-center" v-if="data.numeroPasaporte">
                                        <i class="pi pi-check"></i>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="container">
        <h3>No hay reservas para mostrar</h3>
    </div>



</template>






<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

ul {
    list-style-type: none padding;
    width: 100%;
    text-align: left;
}

li {
    margin: 10px 0;
}
</style>
