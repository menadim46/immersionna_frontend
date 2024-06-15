<script>
import { mapActions, mapState } from 'pinia'
import { useReservasAPIStore } from '@/stores/reservasAPI'
import { useClientesAPIStore } from '@/stores/clientesAPI'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Message from 'primevue/message'
export default { 
  components: { DataTable, Column, Dropdown, Button, Message },
  data() {
    return {
      usernameSeleccionado: null,
      reservasTodas: [],
      reservaActualizar: '',
      usuarioParaFiltrar: '',
      contrasenaRegistrada: '',
      usuarioRegistrado: '',
      showError: false,
      usuarioConsultadoAntesAsignar: '',
      errorAsignar: false

    }
  },
  computed: {
    ...mapState(useReservasAPIStore, ['reservasAPI', 'usuarios', 'tareas', 'usuarioSeleccionado', 'obtenerFecha']),
    ...mapState(useClientesAPIStore, ['clientesAPI', 'clientesCargadosAPI']),

    usuariosAsignables() {
      // let usuariosSeleccionar = [{ usuario: "" }, { usuario: this.usuarioParaFiltrar }]
      let usuariosSeleccionar = [{ usuario: this.usuarioParaFiltrar }]
      return usuariosSeleccionar
    },
    reservasFiltradas() {
      const hoy = new Date()
      let reservasFiltradas

      if (this.usuarioParaFiltrar) {
        reservasFiltradas = this.reservasAPI.filter(reserva =>
          (reserva.usuario === this.usuarioParaFiltrar || reserva.usuario === "" || reserva.usuario === null) &&
          new Date(reserva.servicio.fechaFin) > hoy
        )
      } else {
        reservasFiltradas = this.reservasAPI.filter(reserva =>
          new Date(reserva.servicio.fechaFin) > hoy
        )
      }

      return reservasFiltradas

    },
    reservasOrdenadasPorTareasPendientes() {

      return this.reservasFiltradas.slice().sort((a, b) => {
        const ordenFechaServicio = new Date(a.servicio.fechaInicio) - new Date(b.servicio.fechaInicio)
        const ordenTareasPendientes = this.comprobarTareasPendientes(b) - this.comprobarTareasPendientes(a)
        const ordenUsuarioAsignado = a.usuario - b.usuario

        if (ordenFechaServicio !== 0) {
          return ordenFechaServicio
        } else if (ordenTareasPendientes !== 0) {
          return ordenTareasPendientes
        } else {
          return ordenUsuarioAsignado
        }

      })
    },

    tareasPendientes() {
      const tareasPendientes = {}
      this.reservasAPI.forEach(reserva => {
        tareasPendientes[reserva.id] = this.tareas.length - this.tareas.indexOf(reserva.tareaAsignada) - 1
      })
      return tareasPendientes
    },
  },

  watch: {
    usuarioRegistrado(nuevoUsuario) {
      if (this.comprobarEmpleado(nuevoUsuario, this.contrasenaRegistrada)) {
        this.usuarioParaFiltrar = nuevoUsuario
      } else {
        this.usuarioParaFiltrar = ''
      }
    },
    reservasAPI: 'ordenarReservas'
  },

  methods: {
    ...mapActions(useReservasAPIStore, ['cargarReservasAPI', 'asignarUsuarioStore', 'actualizarReserva', 'completarTareaStore', 'consultaReservaStore']),
    ...mapActions(useClientesAPIStore, ['cargarClienteAPI']),

    obtenerId(url) {
      const parts = url.split('/')
      return parts[parts.length - 1]
    },
    comprobarTareasPendientes(reserva) {
      return this.tareas.length - this.tareas.indexOf(reserva.tareaAsignada) - 1
    },

    async consultar(reserva) {
      try {
        const respuesta = await this.consultaReservaStore(reserva._links.self.href)
        const usuarioRespuesta = respuesta.usuario
        const tareaAsignadaRespuesta = respuesta.tareaAsignada
        const mismaTareayUsuario = (usuarioRespuesta === ("" || null)) && tareaAsignadaRespuesta === reserva.tareaAsignada

        if (!mismaTareayUsuario) {
          this.errorAsignar = true
        }
        return usuarioRespuesta
      } catch (error) {
        console.error('Error al consultar:', error)
        return ''
      }
    },

    async asignarUsuario(reserva) {
      try {
        const usuarioConsultado = await this.consultar(reserva)
        this.usuarioConsultadoAntesAsignar = usuarioConsultado
        if (usuarioConsultado === null || usuarioConsultado === "") {
          await this.asignarUsuarioStore(reserva._links.self.href, reserva.usernameTemporal.usuario)
          this.errorAsignar = false

        }
        reserva.usernameTemporal = ''
      } catch (error) {
        this.errorAsignar = true
        console.error('Error al asignar usuario:', error, reserva.usuario)
      }

    },
    asignarPrimeraTarea(reserva) {
      if (!reserva.tareaAsignada) {
        reserva.tareaAsignada = this.tareas[0]
      }
      return reserva.tareaAsignada
    },

    async completarTarea(reservaCompletar) {
      this.completarTareaStore(reservaCompletar)
      this.ordenarReservas()

    },
    ordenarReservas() {
      this.reservasOrdenadasPorTareasPendientes
    },
    salir() {
      this.usuarioParaFiltrar = ''
      this.usuarioRegistrado = ''
      this.contrasenaRegistrada = ''
    },
    registrarse() {
      if (this.comprobarEmpleado(this.usuarioRegistrado, this.contrasenaRegistrada)) {
        this.usuarioParaFiltrar = this.usuarioRegistrado
        this.showError = false
      } else {
        this.usuarioParaFiltrar = ''
        this.showError = true
      }
    },
    comprobarEmpleado(usuarioIntroducido, contrasenaIntroducida) {
      return this.usuarios.some(u => u.usuario === usuarioIntroducido && usuarioIntroducido === contrasenaIntroducida)
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
    <div class="col-5 mt-3">
      <Message v-if="showError" severity="error" text="Usuario o contraseña incorrectos.">Usuario o contraseña
        incorrectos</Message>

    </div>
    <h4 class="mt-3"><strong>Registrese para asignarse una tarea</strong></h4>
    <div class="input-group mt-3">
      <font-awesome-icon :icon="['fas', 'user']" size="2xl" />
      <input v-model="usuarioRegistrado" type="text" class="form-control ms-5" placeholder="Usuario"
        aria-label="usuarioRegistrado">
      <input v-model="contrasenaRegistrada" type="password" class="form-control ms-5" placeholder="Contraseña"
        aria-label="contrasenaRegistrada">
      <button v-if="!usuarioParaFiltrar" type="button" class="btn btn-success ms-5"
        @click="registrarse">Registrarse</button>
      <button v-if="usuarioParaFiltrar" type="button" class="btn btn-success ms-5" @click="salir">Cerrar Sesión</button>
    </div>
  </div>
  <div>
  </div>
  <div class="container mt-3">
    <h1 class="titulo p-2 text-center"><strong>Listado de Reservas</strong></h1>
    <Message v-if="errorAsignar" severity="error"> Parece que <strong>{{ usuarioConsultadoAntesAsignar }}</strong> ha sido
      más rápido en asignarse la tarea
    </Message>
    <div class="container text-center">
      <div class="row justify-content-end">
        <div class="col-12">
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
              <Column field="servicio" header="Servicio" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                    {{ data.servicio.fechaInicio }} - {{ data.servicio.descripcion }}
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
              <Column field="tareaAsignada" header="Tarea en Curso" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <span :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                    <span v-if="comprobarTareasPendientes(data) !== 0">{{ comprobarTareasPendientes(data) }}/{{
                      this.tareas.length }}
                    </span> {{ asignarPrimeraTarea(data) }}
                  </span>
                </template>
              </Column>
              <Column header="Usuario" style="min-width: 5vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="!data.usuario &&
                    data.tareaAsignada !== 'Se han realizado todas las tareas'">
                    <div v-if="usuarioParaFiltrar" class="card flex justify-content-center">
                      <Dropdown v-model="data.usernameTemporal" :options="usuariosAsignables" checkmark
                        :highlightOnSelect="false" optionLabel="usuario" 
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
                    <span v-if="data.usernameTemporal"
                      :class="{ 'tarea-completada': data.tareaAsignada === 'Se han realizado todas las tareas' }">
                      <i class="pi pi-check-circle" style="font-size: 2rem" @click="asignarUsuario(data)"></i>
                    </span>
                  </div>
                </template>
              </Column>
              <Column header="" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="data.usuario &&
                    data.tareaAsignada &&
                    data.tareaAsignada != 'Se han realizado todas las tareas' && usuarioParaFiltrar"
                    class="ms-3 btn btn-success">
                    <i class="pi pi-play-circle" @click=completarTarea(data) style="font-size: 2rem"></i>
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
  margin: 10px 0
}

.tarea-completada {
  font-weight: 700;
  color: #003366;
}
</style>