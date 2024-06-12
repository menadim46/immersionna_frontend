import { defineStore } from "pinia"
import { getServicios, getReservasServicio, postServicioInmersion, postServicioIntercambio, deleteServicio, patchServicio, getServiciosClienteFecha,putEntidad } from "@/stores/api-service"


export const useServiciosAPIStore = defineStore("serviciosAPI", {
  state: () => ({
    servicios: [],
    serviciosCargados: false,
    tipos: ['Intercambio', 'Inmersion'],
    nivelEstudios: ['ESO', 'Bachiller', 'Universitario'],
    tipoAlojamiento: ['Residencia-Media Pension', 'Residencia- Pension Completa', 'Familia de Acogida'],
    idioma: "",
    usuarios: [{ usuario: "" }, { usuario: "Pepe" }, { usuario: "Juan" }, { usuario: "Maria" }, { usuario: "Julia" }],
    tareas: ["Registrar cliente", "Confirmar Pago", "Confirmar Alojamiento", "Confirmar Transporte", "Se han realizado todas las tareas"],
    servicioConsultar: '',
    reservasServicioConsultado: [],
    serviciosClienteFecha: []
  }),
  mutations: {
    setServiciosClienteFecha(state, servicios) {
      state.serviciosClienteFecha = servicios
    }
  },

  actions: {
    async cargarServicios() {
      this.servicios = []
      this.serviciosCargados = false
      try {
        const response = await getServicios()
        if (response.data._embedded) {
          if (response.data._embedded.serviciosInmersion) {
            const serviciosInmersion = response.data._embedded.serviciosInmersion.map(servicioInmersion => ({
              ...servicioInmersion,
              reservas: [],
            }
            )
            )
            this.servicios = this.servicios.concat(serviciosInmersion)
          }
          if (response.data._embedded.serviciosIntercambio) {
            const serviciosIntercambio = response.data._embedded.serviciosIntercambio.map(servicioIntercambio => ({
              ...servicioIntercambio,
              reservas: [],
            }
            )
            )
            this.servicios = this.servicios.concat(serviciosIntercambio)
          }
        }
        await this.cargarReservasTodosServicios()
        this.serviciosCargados = true
      } catch (error) {
        console.error("Error al cargar servicios:", error)
        this.serviciosCargados = false
      }
    },

    async cargarReservasTodosServicios() {
      const promises = this.servicios.map(async servicio => {
        servicio.reservas = await this.cargarReservasUnServicio(servicio)
      })
      await Promise.all(promises)
    },

    async cargarReservasUnServicio(servicioCargar) {
      try {
        const reservasUnServicio = []
        const response = await getReservasServicio(servicioCargar)
        if (response.data && response.data._embedded) {
          if (response.data._embedded.reservas) {
            const reservas = response.data._embedded.reservas
            const reservasMapeadas = reservas.map((reserva) => ({
              ...reserva,
            }))
            reservasUnServicio.push(...reservasMapeadas)
          }
          return reservasUnServicio
        }
        return []

      } catch (error) {
        console.error("Error al cargar los las reservas del servicio", error)
        return []
      }
    },

    async anadirServicioStore(nuevoServicio) {

      if (nuevoServicio.tipo === 'Intercambio') {
        nuevoServicio.nivelEstudios = nuevoServicio.nivelEstudios
      } else if (nuevoServicio.tipo === 'Inmersion') {
        nuevoServicio.tipoAlojamiento = nuevoServicio.tipoAlojamiento
      }

      try {
        let responseServicios = null
        if (nuevoServicio.tipo === 'Intercambio') {
          responseServicios = await postServicioIntercambio(nuevoServicio)

        } else {
          responseServicios = await postServicioInmersion(nuevoServicio)
        }

        if (responseServicios.status === 200) {
          const servicioAgregado = { ...nuevoServicio, _links: responseServicios.data._links }
          this.servicios.unshift(servicioAgregado)
        }
      } catch (error) {
        console.error("Error: ", error)
      }
    },

    async deleteServicioStore(servicioID) {
      try {
        const response = await deleteServicio(servicioID._links.self.href)
        if (response.status === 200) {
          const index = this.servicios.findIndex(p => p._links.self.href === servicioID)
          if (index !== -1) {
            this.servicios.splice(index, 1)
          }
        }
      } catch (error) {
        console.error("Error: ", error)
      }
    },

    async actualizarServicioStore(href, servicioCambiado) {
      try {
        const index = this.servicios.findIndex(servicio => servicio._links.self.href === href)
        if (index !== -1) {
          this.servicios[index] = { ...this.servicios[index], ...servicioCambiado }
          await patchServicio(href, servicioCambiado)
        }
      } catch (error) {
        console.error("Error al actualizar servicio: ", error)
      }
    },

    async actualizarReservasServicio(href,reservaNueva){
      console.log('anadiendo reserva y cliente')
      await putEntidad(href,reservaNueva)
      
    },

    async guardarServicioConsultado(servicio) {
      const servicioAsignarServicioConsultar = { ...servicio }
      this.servicioConsultar = servicioAsignarServicioConsultar
      this.reservasServicioConsultado = await this.cargarReservasUnServicio(servicio)
      return this.reservasServicioConsultado

    },
    async serviciosClienteStore(clienteConsulta) {
      try {
        const response = await getServiciosClienteFecha(clienteConsulta)
        if (response.status === 200) {
          return response.data
        }
      } catch (error) {
        console.error('Error al cargar servicios del cliente: ', error)
        return null
      }
    },
  }
}
)