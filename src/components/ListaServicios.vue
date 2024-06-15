<script>
// import servicios from '@/assets/servicios.json'
// import { useServiciosStore } from '@/stores/servicios'
import Servicio from '@/components/Servicio.vue'
import { mapActions, mapState } from 'pinia'
import { useServiciosAPIStore } from '@/stores/serviciosAPI'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { ref } from 'vue'

import { Modal } from 'bootstrap'

export default {
  emits: ['servicioSeleccionado'],
  data() {
    return {
      fechaInicio: null,
      tipoServicio: '',
      descripcion: '',
      nivelEstudios: '',
      tipoAlojamiento: '',
      idioma: '',
      fechaInicio: '',
      fechaFin: '',
      numeroAlumnos: '1',
      servicioEditar: '',
      servicioAnadido: false,
      servicioMirar: ''
    }
  },

  components: { Servicio, DataTable, Column, Dropdown, Button, Message, Modal },

  computed: {
    ...mapState(useServiciosAPIStore, ["servicios", "tipos", "servicioConsultar"]),

    serviciosOrdenadosFechaInicio() {

      return this.servicios.slice().sort((a, b) => {
        return new Date(a.fechaInicio) - new Date(b.fechaInicio)
      })
    },

    hoy() {
      return new Date()
    },

    serviciosAnteriores() {
      const hoy = new Date()
      const serviciosAnteriores = this.servicios.filter(servicio => new Date(servicio.fechaFin) < hoy)
      return serviciosAnteriores.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    },

    serviciosConAlojamiento() {
      const hoy = new Date()
      return this.serviciosOrdenadosFechaInicio.filter(servicio => servicio.tipoAlojamiento && new Date(servicio.fechaFin) > hoy)
    },
    serviciosConNivelEstudios() {
      const hoy = new Date()
      return this.serviciosOrdenadosFechaInicio.filter(servicio => servicio.nivelEstudios && new Date(servicio.fechaFin) > hoy)
    }
  },
  watch: {
    servicio: {
      inmedite: true,
      handler(nuevoValor) {
        if (nuevoValor) {
          this.descripcion = nuevoValor.descripcion
          this.fechaInicio = nuevoValor.fechaInicio
          this.fechaFin = nuevoValor.fechaFin
          this.numeroAlumnos = nuevoValor.numeroAlumnos
          this.tipoAlojamiento = nuevoValor.tipoAlojamiento
          this.nivelEstudios = nuevoValor.nivelEstudios

        }
      }
    }
  },

  methods: {
    ...mapActions(useServiciosAPIStore, ['cargarServicios', 'cargarReservasTodosServicios',
      'cargarReservasUnServicio', 'crearNuevoServicioStore',
      'anadirServicioStore', 'deleteServicioStore', 'guardarServicioConsultado', 'actualizarServicioStore']),

    obtenerId(url) {
      const parts = url.split('/')
      return parts[parts.length - 1]
    },

    async guardarServicio() {
      if (!this.tipoServicio || !this.descripcion || !this.fechaInicio) {

        return
      }
      const nuevoServicio = {
        tipo: this.tipoServicio,
        descripcion: this.descripcion,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        disponibilidad: true,
        idioma: this.idioma,
        numeroAlumnos: this.numeroAlumnos,
        nivelEstudios: this.nivelEstudios,
        tipoAlojamiento: this.tipoAlojamiento,
      }
      try {
        await this.anadirServicioStore(nuevoServicio)
        this.resetearCampos();
        this.servicioAnadido = true
      } catch (error) {
        console.error('Error al añadir el servicio:', error)
      }
      this.cargarServicios()
    },

    resetearCampos() {
      this.tipoServicio = ''
      this.descripcion = ''
      this.nivelEstudios = ''
      this.tipoAlojamiento = ''
      this.fechaInicio = ''
      this.fechaFin = ''
      this.idioma = ''
      this.numeroAlumnos = '1'
      this.servicioEditar = ''
    },
    cancelarServicio() {
      this.resetearCampos()
    },

    calcularDisponibilidad(servicio) {
      return servicio.numeroAlumnos - servicio.reservas.length
    },

    mostrarModalEdicion(servicio) {
      this.servicioEditar = servicio
      this.tipoServicio = servicio.tipo || ''
      this.descripcion = servicio.descripcion || ''
      this.fechaInicio = servicio.fechaInicio || ''
      this.fechaFin = servicio.fechaFin || ''
      this.idioma = servicio.idioma || ''
      this.numeroAlumnos = servicio.numeroAlumnos || '1'
      this.nivelEstudios = servicio.nivelEstudios || ''
      this.tipoAlojamiento = servicio.tipoAlojamiento || ''
    },

    async actualizarServicio() {
      const servicioActualizado = {
        tipo: this.tipoServicio,
        descripcion: this.descripcion,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        disponibilidad: this.servicioEditar.disponibilidad,
        idioma: this.idioma,
        numeroAlumnos: this.numeroAlumnos,
        nivelEstudios: this.nivelEstudios,
        tipoAlojamiento: this.tipoAlojamiento,
        _links: this.servicioEditar._links
      }

      try {
        await this.actualizarServicioStore(servicioActualizado._links.self.href, servicioActualizado)
        this.resetearCampos()

      } catch (error) {
        console.error('Error al actualizar el servicio:', error)
      }
      this.cargarServicios()
    },

    borrarServicio(servicioBorrar) {
      const index = this.servicios.findIndex(servicio => servicio === servicioBorrar)
      if (index !== -1) {
        this.servicios.splice(index, 1)
      } else {
        console.error('No se encontró el servicio a borrar en la lista.')
      }
      this.deleteServicioStore(servicioBorrar)
    },

    async visualizarReservas(servicio) {
      const servicioParaStore = { ...servicio }
      await this.guardarServicioConsultado(servicioParaStore)
      this.$router.push({ name: 'informes' })
    }
  },

  mounted() {
    this.cargarServicios()
    this.cargarReservasTodosServicios()
  }
}
</script>

<template>
  <div class="container mt-3">
    <Message severity="success" :sticky="sticky" :life="1000" v-if="servicioAnadido">Se ha añadido el Servicio
    </Message>
    <h1 class="titulo p-2 text-center"><strong>Listado de Servicios</strong></h1>
    <button type="button" class="btn btn-success mb-3" data-bs-toggle="modal" data-bs-target="#exampleModal"
      style="font-size: 1.5em;">
      <h4><i class="pi pi-plus-circle me-3" style="font-size: 1em;"></i> Añadir Servicio</h4>
    </button>
    <div class="container text-center">
      <div class="row justify-content-end">
        <div class="col-12">
          <div class="card">
            <h2 class="titulo p-2 text-center"><strong>Servicios de Inmersión</strong></h2>
            <DataTable :value="serviciosConAlojamiento" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
              stripedRows tableStyle="min-width: 50vw">
              <Column field="id" header="Id" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ obtenerId(data._links.self.href) }}
                </template>
              </Column>
              <Column field="descripcion" header="Descripción" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.descripcion }}
                </template>
              </Column>
              <Column field="idioma" header="Idioma" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.idioma }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Inicio" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaInicio }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Fin" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaFin }}
                </template>
              </Column>
              <Column field="tipoAlojamiento" header="Tipo Alojamiento" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.tipoAlojamiento }}
                </template>
              </Column>
              <Column field="plazas" header="Plazas" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="new Date(data.fechaInicio) < new Date().setHours(0, 0, 0, 0)">
                    <span style="color: green;"><strong>En curso...</strong></span>
                  </div>
                  <div v-else-if="calcularDisponibilidad(data) > 0" style="color: #003366;">
                    <strong>{{ calcularDisponibilidad(data) }}</strong>
                  </div>
                  <div v-else>
                    <div class="pi pi-lock" style="font-size: 1.5em"></div>
                  </div>
                </template>
              </Column>
              <Column field="acciones" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  <i class="pi pi-eye me-2" @click="visualizarReservas(data)"
                    style="color: #003366;font-size: 1.5em"></i>
                  <i data-bs-toggle="modal" data-bs-target="#exampleModal" class="pi pi-file-edit me-2"
                    style="color: #996600;font-size: 1.5em" @click="mostrarModalEdicion(data)"></i>
                  <i class="pi pi-trash" @click=borrarServicio(data) style="color: #660000;font-size: 1.5em"></i>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
    <div class="container text-center mt-5">
      <div class="row justify-content-end">
        <div class="col-12">
          <div class="card">
            <h2 class="titulo p-2 text-center"><strong>Servicios de Intercambio</strong></h2>
            <DataTable :value="serviciosConNivelEstudios" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
              stripedRows tableStyle="min-width: 50vw">
              <Column field="id" header="Id" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ obtenerId(data._links.self.href) }}
                </template>
              </Column>
              <Column field="descripcion" header="Descripción" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.descripcion }}
                </template>
              </Column>
              <Column field="descripcion" header="Idioma" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.idioma }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Inicio" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaInicio }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Fin" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaFin }}
                </template>
              </Column>
              <Column field="nivelEstudios" header="Nivel Estudios" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.nivelEstudios }}
                </template>
              </Column>
              <Column field="plazas" header="Plazas" style="min-width: 1vw" class="fs-5">
                <template #body="{ data }">
                  <div v-if="new Date(data.fechaInicio) < new Date().setHours(0, 0, 0, 0)">
                    <span style="color: green;"><strong>En curso...</strong></span>
                  </div>
                  <div v-else-if="calcularDisponibilidad(data) > 0" style="color: #003366;">
                    <strong>{{ calcularDisponibilidad(data) }} </strong>
                  </div>
                  <div v-else>
                    <div class="pi pi-lock" style="font-size: 1.5em"></div>
                  </div>
                </template>
              </Column>
              <Column field="acciones" style="min-width: 2vw" class="fs-5">
                <template #body="{ data }">
                  <i class="pi pi-eye me-2" @click="visualizarReservas(data)"
                    style="color: #003366;font-size: 1.5em"></i>
                  <i data-bs-toggle="modal" data-bs-target="#exampleModal" class="pi pi-file-edit me-2"
                    style="color: #996600;font-size: 1.5em" @click="mostrarModalEdicion(data)"></i>
                  <i class="pi pi-trash" @click=borrarServicio(data) style="color: #660000;font-size: 1.5em"></i>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
    <div class="container text-center mt-5 mb-5">
      <div class="container text-center mt-5 mb-5">
        <div class="row justify-content-end">
          <div class="col-12">
            <div class="card">
              <h2 class="titulo p-2 text-center"><strong>Servicios Anteriores</strong> </h2>
              <DataTable :value="serviciosAnteriores" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
                stripedRows tableStyle="min-width: 50vw">
                <Column field="id" header="Id" style="min-width: 1vw" class="fs-5">
                  <template #body="{ data }">
                    {{ obtenerId(data._links.self.href) }}
                  </template>
                </Column>
                <Column field="descripcion" header="Descripcion" style="min-width: 11vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.descripcion }}
                  </template>
                </Column>
                <Column field="idioma" header="Idioma" style="min-width: 1vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.idioma }}
                  </template>
                </Column>
                <Column field="fechaInicio" header="Fecha Inicio" style="min-width: 11vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.fechaInicio }}
                  </template>
                </Column>
                <Column field="fechaFin" header="Fecha Fin" style="min-width: 1vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.fechaFin }}
                  </template>
                </Column>
                <Column field="tipoAlojamiento" header="Tipo Alojamiento" style="min-width: 2vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.tipoAlojamiento }}
                  </template>
                </Column>
                <Column field="nivelEstudios" header="Nivel Estudios" style="min-width: 2vw" class="fs-5">
                  <template #body="{ data }">
                    {{ data.nivelEstudios }}
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- MODAL EDICION SERVICIO -->
    <div class="modal fade" ref="exampleModal" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 v-if="!servicioEditar" class="modal-title fs-5" id="exampleModalLabel">Nuevo Servicio</h1>
            <h1 class="modal-title fs-5" v-else-if="!servicioEditar && servicioEditar.tipoAlojamiento">
              <strong>Servicio de Inmersión en {{ servicioEditar.descripcion }}</strong>
            </h1>
            <h1 class="modal-title fs-5" v-else="servicioEditar.nivelEstudios">
              <strong>Servicio de Intercambio {{ servicioEditar.descripcion }}</strong>
            </h1>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handlerSubmit" class="row g-3">
              <div>
                <div v-if="!servicioEditar" class="form-group">
                  <label for="tipoServicio">Tipo de Servicio</label>
                  <select v-model="tipoServicio" class="form-control" @change="handleTipoServicioChange">
                    <option value="">Selecciona un tipo de servicio</option>
                    <option value="Intercambio">Intercambio</option>
                    <option value="Inmersion">Inmersión</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="descripcion">Descripción</label>
                  <input type="text" v-model="descripcion" class="form-control" id="descripcion"
                    placeholder="Ingrese una descripción">
                </div>
                <div class="form-group">
                  <label for="idioma">Idioma</label>
                  <select v-model="idioma" class="form-control" id="nivelEstudios">
                    <option value="Ingles">Inglés</option>
                    <option value="Frances">Francés</option>
                    <option value="Italiano">Italiano</option>
                    <option value="Alemán">Aleman</option>

                  </select>
                </div>
                <div class="form-group">
                  <label for="numeroAlumnos">Numero Alumnos</label>
                  <input type="number" v-model="numeroAlumnos" class="form-control" id="numeroAlumnos"
                    placeholder="cantidad alumnos" min="2" max="30">
                </div>
                
                <div class="col-md-6">
                  <label for="fechaInicio" class="form-label">Fecha-Inicio</label>
                  <input type="date" class="form-control" id="fechaInicio" v-model="fechaInicio" min=hoy required>
                  <div class="valid-feedback">
                    Fecha Valida
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="fechaFin" class="form-label">Fecha-Fin</label>
                  <input type="date" class="form-control" id="fechaInicio" v-model="fechaFin" required>
                  <div class="valid-feedback">
                    Fecha Valida
                  </div>
                </div>
                <div v-if="tipoServicio === 'Inmersion'" class="form-group">
                  <label for="tipoAlojamiento">Tipo de Alojamiento</label>
                  <select v-model="tipoAlojamiento" class="form-control" id="tipoAlojamiento">
                    <option value="Media Pension">Media Pension</option>
                    <option value="Pension Completa">Pension Completa</option>
                    <option value="Sin Manutencion">Sin manutencion</option>
                  </select>
                </div>
                <div v-if="tipoServicio === 'Intercambio'" class="form-group">
                  <label for="nivelEstudios">Nivel de Estudios</label>
                  <select v-model="nivelEstudios" class="form-control" id="nivelEstudios">
                    <option value="">Selecciona un nivel de estudios</option>
                    <option value="ESO">ESO</option>
                    <option value="Bachiller">Bachiller</option>
                    <option value="Universitario">Universitario</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <!-- <Message severity="error" v-if="!idioma">Seleccione un idioma
          </Message> -->
          <Message severity="error" v-if="numeroAlumnos && (numeroAlumnos < 1 || numeroAlumnos > 30)">Número inválido
          </Message>
          <Message severity="error" v-if="fechaInicio && fechaInicio <= new Date()">Fecha Inicio debe ser posterior a
            hoy
          </Message>
          <Message severity="error" v-if="fechaFin && fechaInicio > fechaFin">Fecha Fin debe ser posterior a Fecha
            Inicio
          </Message>
          <Message severity="error"
            v-if="((!descripcion || !fechaInicio || !fechaFin || !idioma || !numeroAlumnos) || (!tipoAlojamiento && !nivelEstudios))">Por favor
            rellena todos los campos</Message>


          <div class="modal-footer">
            <button type="button" @click="cancelarServicio()" class="btn btn-secondary"
              data-bs-dismiss="modal">Cerrar</button>
            <!-- <button v-if="!servicioEditar && (!descripcion || !fechaInicio || !fechaFin || !idioma || !numeroAlumnos)" -->
              <button v-if="!servicioEditar && (descripcion && fechaInicio && fechaFin && idioma && numeroAlumnos)"
            type="button" data-bs-dismiss="modal" @click="guardarServicio()" class="btn btn-primary">Guardar
              Servicio</button>
            <button v-else-if="servicioEditar && descripcion && fechaInicio && fechaFin && idioma && numeroAlumnos"
              type="button" data-bs-dismiss="modal" @click="actualizarServicio()" class="btn btn-primary">Actualizar
              Servicio</button>
            <!-- v-if="()" -->
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
  list-style-type: none;
  padding: 0;
  width: 100%;
  text-align: left;
}

li {
  margin: 10px 0;
}

i {
  cursor: pointer;
}
</style>