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
            clienteSeleccionado: 'Cliente no seleccionado',
            fechaConsulta: '',
            serviciosMostrar: ''
        }
    },
    computed: {
        ...mapState(useReservasAPIStore, ['reservasAPI', 'usuarios', 'tareas', 'usuarioSeleccionado', 'obtenerFecha']),
        ...mapState(useServiciosAPIStore, ['servicios', 'servicioConsultar', 'reservasServicioConsultado', 'serviciosClienteFecha']),
        ...mapState(useClientesAPIStore, ['clientesAPI', 'clientesCargadosAPI'])
    },

    watch: {
        serviciosClienteFecha(nuevosServicios) {
            this.serviciosMostrar = nuevosServicios;
        }
    },
    methods: {
        ...mapActions(useClientesAPIStore, ['cargarClienteAPI']),
        ...mapActions(useServiciosAPIStore, ['serviciosClienteStore']),
        obtenerId(url) {
            const parts = url.split('/')
            return parts[parts.length - 1]
        },
        mostrar(cliente) {
            this.clienteSeleccionado = cliente
        },

        async consultarServiciosCliente() {
            this.serviciosMostrar = ''
            if (this.clienteSeleccionado && this.fechaConsulta) {
                const idConsultar = this.obtenerId(this.clienteSeleccionado._links.self.href)
                const fechaConsultar = this.fechaConsulta
                try {
                    const servicios = await this.serviciosClienteStore({ idConsultar, fechaConsultar });
                    if (servicios  && servicios._embedded && servicios._embedded.servicios) {
                        this.serviciosMostrar = servicios._embedded.servicios;
                    } 
                } catch (error) {
                    console.error('Error para obtener servicios del cliente:', error);
                }
            }
        },
        mostrar(cliente) {
            this.clienteSeleccionado = cliente;
        }
    },

    mounted() {
        this.cargarClienteAPI()
    }
}
</script>

<template>
    <div class="container">
        <h1><strong>Clientes</strong></h1>
    </div>
    <div class="container">
        <h4 style="color: #003366;font-weight: 500;"><strong>{{ this.clienteSeleccionado.nombreApellidos }}</strong>
        </h4>

        <div class="ms-3 me-3 mt-3 mb-3 ">
            <input type="date" class="form-control" id="fechaInicio" v-model="fechaConsulta">
        </div>
        <div v-if="fechaConsulta && clienteSeleccionado"> <Button @click="consultarServiciosCliente()"><i
                    class="pi pi-search me-3"></i>
                Consultar</Button></div>
    </div>
    <div>
        <div class="mt-5 mb-5" v-if="serviciosMostrar">
            <ul class="text-center" v-for="servicio in serviciosMostrar">
                <ol style="color: #003366;font-weight: 600;">
                    {{ servicio.fechaInicio }} - {{ servicio.fechaFin }} , Curso de {{ servicio.idioma }}, en {{
                        servicio.descripcion
                    }} {{ servicio.tipoAlojamiento }}
                </ol>
            </ul>
        </div>
        <div class="text-center" v-else="clienteSeleccionado && serviciosMostrar == ''"> No existen servicios para mostrar</div>
        <div class="text-center mt-3 mb-3" style="color:green;font-weight: 700;"> Seleccione un cliente de la lista y una
            fecha desde la que desea realizar la consulta</div>
            </div>
    <div class="container">
        <DataTable :value="this.clientesAPI" resizableColumns columnResizeMode="fit" paginator :rows="50" stripedRows
            tableStyle="min-width: 30vw">
            <Column field="nombreApellidos" header="Nombre Completo" style="min-width: 3vw" class="fs-5 ">
                <template #body="{ data }">
                    <div>
                        <i class="pi pi-eye me-3" @click="mostrar(data)"></i> {{ data.nombreApellidos }}
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
            <Column field="pasaporte" header="Pasaporte" style="min-width: 3vw" class="fs-5 text-center">
                <template #body="{ data }" class="align-items-center">
                    <div class="text-center" v-if="data.numeroPasaporte">
                        {{ data.numeroPasaporte }}
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    justify-content: center;
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
