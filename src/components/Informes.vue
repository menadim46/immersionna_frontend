<script>
import { mapActions, mapState } from 'pinia'
import { useReservasAPIStore } from '@/stores/reservasAPI'
import { useClientesAPIStore } from '@/stores/clientesAPI'
import { useServiciosAPIStore } from '@/stores/serviciosAPI'
import ListaServicios from '@/components/ListaServicios.vue'
import { ref } from 'vue';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Message from 'primevue/message'


export default {
    components: { DataTable, Column, Dropdown, Button, ListaServicios, Message },
    data() {
        return {
            hoy: new Date(),
            servicio: '',
            nombreApellidos: '',
            correo: '',
            fechaReserva: '',
            numeroPasaporte: '',
            dni: '',
            telefono: '',
            nivelEstudios: '',
            tipoAlojamiento: '',
            clienteObtenerUrl: {},
            clienteUrlEncontrada: ''
        }
    },
    computed: {
        ...mapState(useReservasAPIStore, ['reservasAPI', 'usuarios', 'tareas', 'usuarioSeleccionado', 'obtenerFecha']),
        ...mapState(useServiciosAPIStore, ['servicios', 'servicioConsultar', 'reservasServicioConsultado', 'respuestaClienteCreado']),
        ...mapState(useClientesAPIStore, ['clientesAPI', 'clienteConsultar', 'reservas']),

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
        clientesOrdenadosNombre() {
            this.clientesAPI.slice().sort((a, b) => a.nombreApellidos - b.nombreApellidos);
        },

    },
    setup() {

        const nombreApellidos = ref('');
        const correo = ref('');
        const fechaReserva = ref('');
        const numeroPasaporte = ref('');
        const dni = ref('');
        const telefono = ref('');

        const handleSubmit = async () => {
            const nuevoCliente = {
                nombreApellidos: nombreApellidos.value,
                correo: correo.value,
                fechaReserva: fechaReserva.value,
                numeroPasaporte: numeroPasaporte.value,
                dni: dni.value,
                telefono: telefono.value,
            }

            try {
                const clienteCreado = await useClientesAPIStore.crearCliente(nuevoCliente);
                console.log('Cliente creado:', clienteCreado);
                await reservasStore.anadirReservaStore({
                    cliente: clienteCreado,
                    servicio: servicioConFechaReserva.servicio,
                    fechaReserva: servicioConFechaReserva.fechaReserva,
                });

                console.log('Reserva añadida con éxito');
            } catch (error) {
                console.error('Error al guardar la reserva:', error);
            }
        };

        return {
            nombreApellidos,
            correo,
            fechaReserva,
            numeroPasaporte,
            dni,
            telefono,
            handleSubmit,
            respuestaCreacionParaCliente: useClientesAPIStore.respuestaClienteCreado,
        };
    },

    watch: {
        reserva: {
            inmedite: true,
            handler(nuevoValor) {
                if (nuevoValor) {
                    this.nombreApellidos = nuevoValor.nombreApellidos
                    this.correo = nuevoValor.correo
                    this.fechaReserva = nuevoValor.fechaReserva
                    this.numeroPasaporte = nuevoValor.numeroPasaporte
                    this.dni = nuevoValor.dni
                    this.telefono = nuevoValor.telefono


                }
            }
        }
    },
    methods: {
        ...mapActions(useReservasAPIStore, ['cargarReservasAPI', 'asignarUsuarioStore', 'actualizarReserva', 'completarTareaStore', 'anadirReservaStore']),
        ...mapActions(useClientesAPIStore, ['cargarClienteAPI', 'crearCliente', 'actualizarDatosCliente']),
        ...mapActions(useServiciosAPIStore, ['cargarServicios', 'consultar', 'consultarReservasServicio', 'cargarReservasTodosServicios', 'actualizarReservasServicio']),
       
        diasRestantes(fechaInicio) {
            const hoy = new Date();
            const fechaServicio = new Date(fechaInicio);
            const diferenciaMilisegundos = fechaServicio - hoy;
            const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 3600 * 24));
            return diasRestantes;
        },

        async guardarReserva() {
            const clienteGrabar = {
                dni: this.dni,
                correo: this.correo,
                telefono: this.telefono,
                nombreApellidos: this.nombreApellidos,
                numeroPasaporte: this.numeroPasaporte,
                url: this.respuestaCreacionParaCliente
            }

            try {
                const promesas = [
                    this.crearOActualizarCliente(clienteGrabar),
                    console.log('informes', this.respuestaCreacionParaCliente),

                    this.cargarClienteAPI(),

                    this.obtenerUrlCliente(clienteGrabar.dni),
                ];
                console.log('informes', this.respuestaCreacionParaCliente)

                const resultados = await Promise.all(promesas);
                console.log('Todas las promesas completadas:', resultados);
            } catch (error) {
                console.error('Error al guardar la reserva:', error);
            }
            const servicioConFechaReserva = {
                fechaReserva: this.fechaReserva,
                cliente: this.respuestaCreacionParaCliente._links.cliente.href,
                servicio: this.servicioConsultar._links.self.href,
                tareaAsignada: "Registrar cliente"
            }
            this.cargarClienteAPI(),
                console.log('despues de cargar desde guardarReserva', this.respuestaClienteCreado)
            console.log('informes', this.respuestaCreacionParaCliente)
            await this.crearNuevaReserva(servicioConFechaReserva)
            await this.cargarReservasAPI()
            this.resetearCampos()
        },

        async crearOActualizarCliente(clienteComprobar) {
            const clientePertenece = this.clientesAPI.find(cliente => cliente.dni === clienteComprobar.dni);
            if (clientePertenece) {
                await this.actualizarDatosCliente(clientePertenece, clienteComprobar)
                console.log('actualizo cliente con estos datos', clientePertenece)
            } else {
                console.log('creo cliente', clienteComprobar)
                this.clienteUrlEncontrada = await this.crearCliente(clienteComprobar)
                console.log('respuesta desde componente', this.clienteUrlEncontrada)
                this.respuestaCreacionParaCliente = this.clienteUrlEncontrada
                await this.cargarClienteAPI()
            }
            console.log('informes', this.respuestaCreacionParaCliente)
        },

        async obtenerUrlCliente(dniComprobar) {
            console.log('dni para comprobar', dniComprobar);
            this.clienteUrlEncontrada = this.clientesAPI.find(cliente => cliente.dni === dniComprobar);
            if (!this.clienteUrlEncontrada) {
                this.cargarClienteAPI()
                this.clienteUrlEncontrada = this.respuestaClienteCreado
                console.log('ultimo cliente despues de crear', this.clientesAPI)
            }
        },

        async crearNuevaReserva(servicio, cliente) {
            this.anadirReservaStore(servicio, cliente)
        },

        resetearCampos() {
            // this.servicio = '',
            this.nombreApellidos = '',
                this.correo = '',
                this.fechaReserva = '',
                this.numeroPasaporte = '',
                this.dni = '',
                this.telefono = ''
        },

    },
    mounted() {
        this.cargarReservasAPI()
        this.cargarClienteAPI()
        this.cargarServicios()
    }
}

</script>


<template>

    <div class="row mt-3 mb-3">
        <div class="col-sm-6 d-flex justify-content-end">
            <router-link to="/listaServicios">
                <button type="button" class="btn btn-success " style="font-size: 1.5em;background-color: black;">
                    <div><i class="pi pi-arrow-circle-left" style="font-size: 1em;"></i> Servicios</div>
                </button>
            </router-link>

        </div>
        <div class="col-sm-6 justify-content-center">
            <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#formularioReserva"
                style="font-size: 1.5em;">
                <div><i class="pi pi-plus-circle me-3" style="font-size: 1em;"></i> Añadir Reserva</div>
            </button>


        </div>
    </div>
    <div>
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
                        <h6 style="color: red;font-weight: 600;"
                            v-if="diasRestantes(this.servicioConsultar.fechaInicio) > 0">Quedan {{
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
                            <Column field="numeroPasaporte" header="Pasaporte" style="min-width: 3vw"
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
                            <Column field="numeroPasaporte" header="Pasaporte" style="min-width: 3vw"
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
        <h3>Seleccione un sevicio para mostrar sus reservas</h3>
    </div>


    <!-- MODAL RESERVAS -->
    <div class="modal fade" ref="formularioReserva" id="formularioReserva" tabindex="-1"
        aria-labelledby="formularioReservaLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 v-if="servicioConsultar" class="modal-title fs-5" id="exampleModalLabel">{{
                        this.servicioConsultar.idioma }} -
                        {{ this.servicioConsultar.descripcion }}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        {{ new Date(this.servicioConsultar.fechaInicio).toLocaleDateString() }} -
                        {{ new Date(this.servicioConsultar.fechaFin).toLocaleDateString() }}
                        <br>
                        {{ this.servicioConsultar.tipoAlojamiento }} {{ this.servicioConsultar.nivelEstudios }}
                    </h1>
                </div>
                <div class="modal-body">
                    <form @submit.handleSubmit="enviarFormulario" class="row g-3">
                        <div>
                            <div class="form-group">
                                <label for="fechaReserva">Fecha de Reserva</label>
                                <input type="date" class="form-control" id="fechaReserva" v-model="fechaReserva" min=hoy
                                    required aria-label="Disabled input example">

                            </div>

                            <label> Debe ser cliente para poder dar de alta una reserva </label>
                            <div>
                                <div class="form-group">
                                    <label for="dni">DNI</label>
                                    <input type="text" class="form-control" id="dni" v-model="dni">
                                    <label for="nombreApellidos">Nombre Apellidos</label>
                                    <input type="text" class="form-control" id="nombreApellidos"
                                        v-model="nombreApellidos">
                                    <label for="telefono">Teléfono</label>
                                    <input type="text" class="form-control" id="telefono" v-model="telefono">
                                    <label for="correo">Correo</label>
                                    <input type="text" class="form-control" id="correo" v-model="correo">
                                    <label for="numeroPasaporte">Nº pasaporte</label>
                                    <input type="text" class="form-control" id="numeroPasaporte"
                                        v-model="numeroPasaporte">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>


                <Message severity="error" v-if="fechaReserva > new Date()">Fecha Reserva debe ser anterior a
                    hoy
                </Message>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>


                    <button type="button" data-bs-dismiss="modal" @click="guardarReserva()"
                        class="btn btn-primary">Guardar
                        Reserva</button>
                </div>
            </div>
        </div>
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
