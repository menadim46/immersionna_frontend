<script>
import { mapActions, mapState } from 'pinia'
import { useReservasAPIStore } from '@/stores/reservasAPI'
import { useClientesAPIStore } from '@/stores/clientesAPI'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'

export default {
  components: { DataTable, Column, Dropdown, Button },
  data() {
    return {
      usernameSeleccionado: null,
      reservasTodas: [],
      reservaActualizar: '',
      usuarioParaFiltrar: '',
      contrasenaRegistrada: '',
      usuarioRegistrado: '',

    }
  },
  computed: {
    ...mapState(useReservasAPIStore, ['reservasAPI', 'usuarios', 'tareas', 'usuarioSeleccionado', 'obtenerFecha']),
    ...mapState(useClientesAPIStore, ['clientesAPI', 'clientesCargadosAPI']),

    usuariosAsignables() {
      let usuariosSeleccionar = [{ usuario: "" }, { usuario: this.usuarioParaFiltrar }]
      return usuariosSeleccionar
    },
    reservasFiltradas() {


      return this.usuarioParaFiltrar ? this.reservasAPI.filter(reserva => reserva.usuario === this.usuarioParaFiltrar || reserva.usuario === "")

        : this.reservasAPI;


    },
    reservasOrdenadasPorTareasPendientes() {

      return this.reservasFiltradas.slice().sort((a, b) => {
        const ordenFecha = new Date(a.fechaInicioServicio) - new Date(b.fechaInicioServicio);
        return ordenFecha !== 0 ? ordenFecha : this.comprobarTareasPendientes(b) - this.comprobarTareasPendientes(a);
      });
    },
    tareasPendientes() {
      const tareasPendientes = {};
      this.reservasAPI.forEach(reserva => {
        tareasPendientes[reserva.id] = this.tareas.length - this.tareas.indexOf(reserva.tareaAsignada) - 1;
      });
      return tareasPendientes;
    },


  },

  watch: {
    usuarioRegistrado(nuevoUsuario) {
      if (this.comprobarEmpleado(nuevoUsuario, this.contrasenaRegistrada)) {
        this.usuarioParaFiltrar = nuevoUsuario;
      } else {
        this.usuarioParaFiltrar = '';
      }
    },
    reservasAPI: 'ordenarReservas',
    reservasAPI: 'ordenarReservas'
  },

  methods: {
    ...mapActions(useReservasAPIStore, ['cargarReservasAPI', 'asignarUsuarioStore', 'actualizarReserva', 'completarTareaStore']),
    ...mapActions(useClientesAPIStore, ['cargarClienteAPI']),

    obtenerId(url) {
      const parts = url.split('/')
      return parts[parts.length - 1]
    },
    comprobarTareasPendientes(reserva) {
      return this.tareas.length - this.tareas.indexOf(reserva.tareaAsignada) - 1
    },

    async asignarUsuario(reserva) {
      if (reserva.usernameTemporal && !reserva.usuario) {
        try {
          await this.asignarUsuarioStore(reserva._links.self.href, reserva.usernameTemporal.usuario);
          reserva.usernameTemporal = ''
        } catch (error) {
          console.error('Error al asignar usuario:', error);
        }
      } else {
        console.log('Usuario ya asignado o no seleccionado');
      }
    },
    asignarPrimeraTarea(reserva) {
      if (!reserva.tareaAsignada) {
        reserva.tareaAsignada = this.tareas[0];
      }
      return reserva.tareaAsignada;
    },

    async completarTarea(reservaCompletar) {
      this.completarTareaStore(reservaCompletar)
      this.ordenarReservas();

    },
    ordenarReservas() {
      this.reservasOrdenadasPorTareasPendientes;
    },
    salir() {
      this.usuarioParaFiltrar = ''
      this.usuarioRegistrado = ''
      this.contrasenaRegistrada = ''
    },
    registrarse() {
      if (this.comprobarEmpleado(this.usuarioRegistrado, this.contrasenaRegistrada)) {
        this.usuarioParaFiltrar = this.usuarioRegistrado;
      } else {
        this.usuarioParaFiltrar = '';
        alert('Usuario o contraseña incorrectos.');
      }
    },
    comprobarEmpleado(usuarioIntroducido, contrasenaIntroducida) {
      return this.usuarios.some(u => u.usuario === usuarioIntroducido && usuarioIntroducido === contrasenaIntroducida);
    }


  },
  mounted() {
    this.cargarReservasAPI()
    this.cargarClienteAPI()
  }
}

</script>


<template>
  <div class="container col-4">
    <h4 class="mt-5"><strong>Registrese para asignarse una tarea</strong></h4>
    <div class="input-group mt-3">
      <font-awesome-icon :icon="['fas', 'user']" size="2xl" />
      <input v-model="usuarioRegistrado" type="text" class="form-control ms-5" placeholder="Usuario"
        aria-label="usuarioRegistrado">
      <input v-model="contrasenaRegistrada" type="password" class="form-control ms-5" placeholder="Contraseña"
        aria-label="contrasenaRegistrada">
      <button v-if="!usuarioParaFiltrar" type="button" class="btn btn-success ms-5" @click="registrarse">Registrarse</button>
      <button v-if="usuarioParaFiltrar" type="button" class="btn btn-success ms-5" @click="salir">Cerrar Sesión</button>

    </div>
    <div>
    </div>
  </div>
  <div>
  </div>
  <div class="container mt-3">
    <h1 class="titulo p-2 text-center"><strong>Listado de Reservas</strong></h1>

    <div class="container text-center">
      <div class="row justify-content-end">
        <div class="col-12">
          <!-- DOS OPCIONES: mostrar reservas del usuario y no asignados o todas y que solo se asigne el registrado, -->
          <!-- <div class="card"
            v-if="usuarioParaFiltrar && usuarioRegistrado == contrasenaRegistrada && comprobarEmpleado(usuarioParaFiltrar)"> -->
          <div class="card">
            <DataTable :value="this.reservasOrdenadasPorTareasPendientes" paginator :rows="50" stripedRows
              tableStyle="min-width: 60vw">
              <Column field="id" header="Id" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">

                    {{ obtenerId(data._links.self.href) }}
                  </span>
                </template>
              </Column>
              <Column field="nombreApellidosCliente" header="Nombre y Apellidos" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                    {{ data.nombreApellidosCliente }}

                  </span>
                </template>
              </Column>
              <Column field="fechaServicio" header="Inicio Servicio" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">

                    {{ data.fechaInicioServicio }}
                  </span>
                </template>
              </Column>
              <Column field="fechaReserva" header="Fecha Reserva" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">

                    {{ data.fechaReserva }}
                  </span>
                </template>
              </Column>
              <Column header="Quedan" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="comprobarTareasPendientes(data) > 0">
                    <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                      {{ comprobarTareasPendientes(data) }} tareas
                    </span>
                  </div>
                </template>
              </Column>
              <Column field="tareaAsignada" header="Tarea en Curso" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">

                    {{ asignarPrimeraTarea(data) }}
                  </span>
                </template>
              </Column>
              <Column header="Usuario" style="min-width: 5vw;" class="fs-5">
                <template #body="{ data }">
                  <div v-if="!data.usuario &&
                    data.tareaAsignada !== 'Se han realizado todas las tareas'">
                    <div v-if="usuarioParaFiltrar" class="card flex justify-content-center">
                      <Dropdown v-model="data.usernameTemporal" :options="usuariosAsignables" checkmark
                        :highlightOnSelect="false" optionLabel="usuario" placeholder="Elige usuario"
                        class="w-full md:w-14rem">
                      </Dropdown>
                    </div>
                  </div>
                  <div class="mt-1 mt-2 mb-3" id="usuario-asignado" v-else>
                    <strong>{{ data.usuario }} </strong>
                  </div>
                </template>
              </Column>
              <Column field="tareaAsignada" header="" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="!data.usuario &&
                    data.tareaAsignada !== 'Se han realizado todas las tareas'">
                    <span v-if="usuarioParaFiltrar" :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                      <i class="pi pi-check-circle" style="font-size: 2rem" @click="asignarUsuario(data)"></i>
                    </span>
                  </div>
                </template>
              </Column>

              <Column header="" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">

                  <div v-if="data.usuario &&
                    data.tareaAsignada &&
                    data.tareaAsignada != 'Se han realizado todas las tareas' && usuarioParaFiltrar" class="ms-3 btn btn-success">
                    <i  class="pi pi-play-circle" @click=completarTarea(data) style="font-size: 2rem"></i>

                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
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

.tarea-completada {
  font-weight: 700;
  color: #003366;
}
</style>