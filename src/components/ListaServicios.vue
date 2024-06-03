<script>
// import servicios from '@/assets/servicios.json'
import Servicio from '@/components/Servicio.vue'
import { mapActions, mapState } from 'pinia'
// import { useServiciosStore } from '@/stores/servicios'
import { useServiciosAPIStore } from '@/stores/serviciosAPI'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { ref } from 'vue';

// import Avatar from 'primevue/avatar'
// import InputText from 'primevue/inputtext'

export default {

  data() {
    return {
      fechaInicio: null,
       tipoServicio: '',
      descripcion: '',
      nivelEstudios: '',
      tipoAlojamiento: '',
      idioma:'',
      fechaInicio:'',
      fechaFin:'',
      numeroAlumnos:''
    }
  },


  components: { Servicio, DataTable, Column, Dropdown, Button },

  computed: {
    // ...mapState(useServiciosStore, ["usuarios", "tareas"]),
    ...mapState(useServiciosAPIStore, ["servicios", "tipos"]),
    serviciosOrdenadosFecha() {
      return this.servicios.slice().sort((a, b) => {
        return new Date(a.fechaInicio) - new Date(b.fechaInicio);
      });

    },

    hoy(){
return new Date()
    },

    serviciosAnteriores() {
      const hoy = new Date()
      const serviciosAnteriores = this.servicios.filter(servicio => new Date(servicio.fechaFin) < hoy);
       return serviciosAnteriores.sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin));

    },

    serviciosConAlojamiento() {
      const hoy = new Date()
      return this.serviciosOrdenadosFecha.filter(servicio => servicio.tipoAlojamiento && new Date(servicio.fechaFin) > hoy);
    },
    serviciosConNivelEstudios() {
      const hoy = new Date()
      return this.serviciosOrdenadosFecha.filter(servicio => servicio.nivelEstudios  && new Date(servicio.fechaFin) > hoy);
    }
    
   
  },

  methods: {
    ...mapActions(useServiciosAPIStore, ['cargarServicios', 'cargarReservasTodosServicios', 
    'cargarReservasUnServicio', 'crearNuevoServicioStore', 
    'anadirServicioStore', 'deleteServicioStore']),


    obtenerId(url) {
      const parts = url.split('/')
      return parts[parts.length - 1]
    },

    handleTipoServicioChange() {
      this.nivelEstudios = ''
      this.tipoAlojamiento = ''
      this.descripcion = ''
      this.fechaInicio = ''
    },
    borrarServicio(servicioBorrar) {
      const index = this.servicios.findIndex(servicio => servicio === servicioBorrar);
      if (index !== -1) {
        this.servicios.splice(index, 1);
      } else {
        console.error('No se encontró el servicio a borrar en la lista.');
      }
      this.deleteServicioStore(servicioBorrar);
    },

    async guardarServicio() {
      if (!this.tipoServicio || !this.descripcion || !this.fechaInicio) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
      }

      const nuevoServicio = {
        tipo: this.tipoServicio,
        descripcion: this.descripcion,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin,
        disponibilidad:true,
        idioma: this.idioma,
        numeroAlumnos:this.numeroAlumnos,
        nivelEstudios: this.nivelEstudios,
        tipoAlojamiento: this.tipoAlojamiento,
      };

      try {
        await this.anadirServicioStore(nuevoServicio);
        this.resetearCampos();
        this.cargarServicios();
      } catch (error) {
        console.error('Error al añadir el servicio:', error);
      }
    }
    ,
    resetearCampos() {
      this.tipoServicio = ''
      this.descripcion = ''
      this.nivelEstudios = ''
      this.tipoAlojamiento = ''
      this.fechaInicio = ''
      this.fechaFin = ''
      this.idioma = ''
      this.numeroAlumnos = ''


    },


    cancelarServicio() {
      this.resetearCampos()
    },
    calcularDisponibilidad(servicio){
      return servicio.numeroAlumnos - servicio.reservas.length
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
    <h1 class="titulo p-2 text-center"><strong>Listado de Servicios</strong></h1>
    <button type="button" class="btn btn-success mb-3" data-bs-toggle="modal" data-bs-target="#exampleModal"
      style="font-size: 1.5em;">
      <i class="pi pi-plus-circle me-3" style="font-size: 1.2em;"></i> Añadir Servicio
    </button>
    <div class="container text-center">
      <div class="row justify-content-end">
        <div class="col-12">
          <div class="card">
            <h2 class="titulo p-2 text-center"><strong>Servicios de Inmersión</strong></h2>
            <DataTable :value="serviciosConAlojamiento" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
              stripedRows tableStyle="min-width: 60vw">
              <Column field="id" header="Id" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ obtenerId(data._links.self.href) }}
                </template>
              </Column>
              <Column field="descripcion" header="Descripción" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.descripcion }} 
                </template>
              </Column>
              <Column field="descripcion" header="Idioma" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.idioma }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Inicio" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaInicio }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Fin" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaFin }}
                </template>
              </Column>
              <Column field="tipoAlojamiento" header="Tipo Alojamiento" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.tipoAlojamiento }}
                </template>
              </Column>
              <Column field="plazas" header="Plazas" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <div style="color: #003366;" v-if="(data.numeroAlumnos - data.reservas.length) > 0">
                    <strong>{{calcularDisponibilidad(data)}}</strong>
                  </div>
                  <div v-else>
                    <i class="pi pi-lock"  style="font-size: 1.5em"></i>
                  </div>
                </template>
              </Column>
              <Column field="acciones"style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <!-- <i class="pi pi-eye me-5"  style="color: #003366;font-size: 1.5em"></i>
                  <i class="pi pi-file-edit me-5" style="color: #996600;font-size: 1.5em"></i> -->
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
              stripedRows tableStyle="min-width: 60vw">
              <Column field="id" header="Id" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ obtenerId(data._links.self.href) }}
                </template>
              </Column>
              <Column field="descripcion" header="Descripción" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.descripcion }}
                </template>
              </Column>
              <Column field="descripcion" header="Idioma" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.idioma }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Inicio" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaInicio }}
                </template>
              </Column>
              <Column field="fechaServicio" header="Fecha Fin" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaFin }}
                </template>
              </Column>
              <Column field="nivelEstudios" header="Nivel Estudios" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.nivelEstudios }}
                </template>
              </Column> 
              <Column field="plazas" header="Plazas" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <div style="color: #003366;" v-if="(data.numeroAlumnos - data.reservas.length) > 0">
                    <strong>{{calcularDisponibilidad(data)}}</strong>
                  </div>
                  <div v-else>
                    <i class="pi pi-lock"  style="font-size: 1.5em"></i>
                  </div>
                </template>
              </Column>
              <Column field="acciones" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  <!-- <i class="pi pi-eye me-5" style="color: #003366;font-size: 1.5em"></i>
                  <i class="pi pi-file-edit me-5" style="color: #996600;font-size: 1.5em"></i> -->
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
            <h2 class="titulo p-2 text-center"><strong>Servicios Anteriores</strong> </h2>
            <DataTable :value="serviciosAnteriores" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]"
              stripedRows tableStyle="min-width: 60vw">
              <Column field="id" header="Id" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ obtenerId(data._links.self.href) }}
                </template>
              </Column>
              <Column field="descripcion" header="Descripcion" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.descripcion }}
                </template>
              </Column>
              <Column field="idioma" header="Idioma" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.idioma }}
                </template>
              </Column>
              <Column field="fechaInicio" header="Fecha Inicio" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaInicio }}
                </template>
              </Column>
              <Column field="fechaFin" header="Fecha Fin" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.fechaFin }}
                </template>
              </Column>
              <Column field="tipoAlojamiento" header="Tipo Alojamiento" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.tipoAlojamiento }}
                </template>
              </Column>
              <Column field="nivelEstudios" header="Nivel Estudios" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.nivelEstudios }}
                </template>
              </Column>
              <Column field="plazas" header="Plazas" style="min-width: 3vw" class="fs-5">
                <template #body="{ data }">
                  {{ data.numeroAlumnos }}
                </template>
              </Column>
              
             
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </div>


  

  <div class="container">
   
    <!-- MODDAL EDICION SERVICIO -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Nuevo Servicio</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="enviarFormulario" class="row g-3">
              <div>
                <div class="form-group">
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
                    <option value="ingles">Inglés</option>
                    <option value="frances">Francés</option>
                    <option value="italiano">Italiano</option>
                    <option value="alemán">Aleman</option>
                  </select>
                  <!-- <input type="text" v-model="idioma" class="form-control" id="descripcion"
                    placeholder="Ingrese un idioma"> -->
                </div>
                <div class="form-group">
                  <label for="numeroAlumnos">Numero Alumnos</label>
                  <input type="text" v-model="numeroAlumnos" class="form-control" id="numeroAlumnos"
                    placeholder="cantidad alumnos">
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
                <div class="col-md-6">
                  <label for="fechaInicio" class="form-label">Fecha-Inicio</label>
                  <input type="date" class="form-control" id="fechaInicio" v-model="fechaInicio" required>
                  <div class="valid-feedback">
                    Fecha Valida
                  </div>
                </div>
                <div class="col-md-6">
                  <label for="fechaFin" class="form-label">Fecha-FIn</label>
                  <input type="date" class="form-control" id="fechaInicio" v-model="fechaFin" required>
                  <div class="valid-feedback">
                    Fecha Valida
                  </div>
                </div>
                <div v-if="tipoServicio === 'Inmersion'" class="form-group">
                  <label for="tipoAlojamiento">Tipo de Alojamiento</label>
                  <select v-model="tipoAlojamiento" class="form-control" id="tipoAlojamiento">
                    <option value="mediaPension">Media Pension</option>
                    <option value="pensionCompleta">Pension Completa</option>
                    <option value="sinmanutencion">Sin manutencion</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" @click="cancelarServicio()" class="btn btn-secondary"
              data-bs-dismiss="modal">Cerrar</button>
            <button type="button" @click="guardarServicio()" class="btn btn-primary">Guardar Servicio</button>
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
</style>