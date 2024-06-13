<script>
import { mapActions, mapState } from 'pinia'
import { useClientesAPIStore } from '@/stores/clientesAPI'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Listbox from 'primevue/listbox'

export default {
    components: { DataTable, Column, Dropdown, Button, Message },

    data() {
        return {
            usuarioSeleccionado: ''
        }
    },

    computed: {
        ...mapState(useClientesAPIStore, ['clientesAPI', 'clientesCargadosAPI']),
        ordenarClientes() {
            return this.clientesAPI.slice().sort((a, b) => {
                b.dni - a.dni
            })
        }
    },

    methods: {
        ...mapActions(useClientesAPIStore, ['cargarClienteAPI']),
    },

    mounted() {
        this.cargarClienteAPI()
    }
}
</script>

<template>
    <div class="container text-center mt-5 mb-5">
        <div class="row justify-content-end">
            <div class="col-12">
                <div class="card">
                    <div class="card flex justify-content-center">
                    </div>
                    <DataTable :value="this.ordenarClientes" paginator :rows="20" stripedRows
                        tableStyle="min-width: 15vw">
                        <Column field="dni" header="DNI" style="min-width: 1vw" class="fs-5">
                            <template #body="{ data }">
                                {{ data.dni }}
                            </template>
                        </Column>
                        <Column field="nombreApellidos" header="Nombre" style="min-width: 3vw" class="fs-5">
                            <template #body="{ data }">
                                {{ data.nombreApellidos }}
                            </template>
                        </Column>
                        <Column field="correo" header="Correo" style="min-width: 3vw" class="fs-5">
                            <template #body="{ data }">
                                {{ data.correo }}
                            </template>
                        </Column>

                        <Column field="telefono" header="Telefono" style="min-width: 3vw" class="fs-5">
                            <template #body="{ data }">
                                {{ data.telefono }}
                            </template>
                        </Column>
                        <Column field="numeroPasaporte" header="Pasaporte`" style="min-width: 3vw" class="fs-5">
                            <template #body="{ data }">
                                {{ data.numeroPasaporte }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>
        </div>
    </div>
</template>