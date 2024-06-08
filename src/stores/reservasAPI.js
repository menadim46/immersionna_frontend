import { defineStore } from "pinia"

import { getReservas, getServicioDeReserva, putReserva, patchReserva, getCliente, consultaReserva } from "@/stores/api-service.js"

export const useReservasAPIStore = defineStore("reservasAPI", {
  state: () => ({
    reservasAPI: [],
    reservasCargadasAPI: false,
    usuarios: [{ usuario: "" }, { usuario: "Pepe" }, { usuario: "Juan" }, { usuario: "Maria" }, { usuario: "Julia" }],
    tareas: ["Registrar cliente", "Confirmar Pago", "Confirmar Alojamiento", "Confirmar Transporte",
      "Confirmar llegada al pais por anfitrión", "Confirmar salida del país por anfitrión",
      "Llegada a España", "Se han realizado todas las tareas"],
    usuarioSeleccionado: "",
    fechaInicio: "",


  }),

  actions: {
    async cargarReservasAPI() {
      this.reservasAPI = [];
      this.reservasCargadasAPI = false;

      try {
        const response = await getReservas();
        if (response.data._embedded && response.data._embedded.reservas) {
          const promises = response.data._embedded.reservas.map(async (reserva) => {
            const datosServicio = await this.obtenerFecha(reserva._links.servicio.href)
            const nombreApellidosCliente = reserva._links.cliente.href
            const respuestaCliente = await getCliente(reserva._links.cliente.href)
            return {
              ...reserva,
              servicio: datosServicio,
              nombreApellidosCliente: respuestaCliente.data.nombreApellidos,
              correo:respuestaCliente.data.correo,
              dni:respuestaCliente.data.dni,
              telefono:respuestaCliente.data.telefono,
              numeroPasaporte:respuestaCliente.data.numeroPasaporte,
              urlCliente:respuestaCliente.data._links.self.href
            };
          });
          this.reservasAPI = await Promise.all(promises);

          this.reservasCargadasAPI = true;
        }
      } catch (error) {
        console.error("Error al cargar reservas:", error);
        this.reservasCargadasAPI = false;
      }
    },

    async obtenerFecha(url) {
      try {
        const response = await getServicioDeReserva(url);
        return response.data
      } catch (error) {
        return;
      }
    }
    ,
    completarTareaStore(reserva) {
      const tareaActual = reserva.tareaAsignada
      const index = this.tareas.findIndex(tarea => tarea === reserva.tareaAsignada)
      reserva.tareaAsignada = this.tareas[index + 1]
      reserva.usuario = ""
      const reservaActualizar = { ...reserva }

      putReserva(reserva._links.self.href, reservaActualizar)

    },
    async actualizarReserva(reserva) {
      const reservaActualizar = { ...reserva }
      try {
        await patchReserva(reserva, reservaActualizar)
      } catch (error) {
        console.error("Error al actualizar reserva:", error)
      }

    },
    async consultaReservaStore(reserva) {
      try {
        const respuesta = await consultaReserva(reserva)
        return respuesta.data
      } catch (error) {
        console.log("Error al consultar la reserva ", reserva, error)
      }
    },

    async actualizarReserva(reserva) {
      const index = this.reservas.findIndex(r => r._links.self.href === reserva.url)
      if (index !== -1) {
        try {
          const datosActualizados = {
            nombreApellidosCliente: reserva.nombreApellidosCliente,
            fechaReserva: reserva.fechaReserva,
            tareaAsignada: "",
            usuario: ""
          }
          const response = await patchReserva(this.reservas[index]._links.self.href, datosActualizados)

          if (response.status === 200) {
            const reservaActualizada = { ...this.reservas[index], ...datosActualizados }
            this.reservas[index] = reservaActualizada
          } else {
            console.error("Error al actualizar la reserva")
          }
        } catch (error) {
          console.error("Error:", error)
        }
      } else {
        console.log("Reserva no encontrada")
      }
    },
    
    asignarUsuarioStore(reservaHref, usuarioCambiado) {
      const index = this.reservasAPI.findIndex(reserva => reserva._links.self.href === reservaHref)
      if (index !== -1) {
        this.reservasAPI[index].usuario = usuarioCambiado
        const reservaActualizada = {
          fechaReserva: this.reservasAPI[index].fechaReserva,
          nombreApellidosCliente: this.reservasAPI[index].nombreApellidosCliente,
          tareaAsignada: this.reservasAPI[index].tareaAsignada,
          usuario: usuarioCambiado.usuario
        }

        const reservaPasar = { ...reservaActualizada }
        putReserva(reservaHref, this.reservasAPI[index])
      }
    },
    
}})
