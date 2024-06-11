import { defineStore } from "pinia"
import serviciosData from '@/assets/servicios.json'

export const useServiciosStore = defineStore('serviciosStore', {
    state: () => ({

        servicios: serviciosData._embedded.serviciosIntercambio.map((servicio) => ({
            ...servicio,
            reservas: servicio.reservas.map((reserva) => ({
                ...reserva,
                fechaServicio: servicio.fechaInicio,
                id: reserva._links.self.href.split("/").pop(),    
                idServicio: servicio._links.self.href.split("/").pop() 
            }))
        })),

        usuarios: [{usuario:""},{usuario:"Pepe"},{usuario:"Juan"},{usuario:"Maria"},{usuario:"Julia"}],

        tareas: ["Registrar cliente", "Confirmar Pago", "Confirmar Alojamiento", "Confirmar Transporte", "Se han realizado todas las tareas"],

        usuarioSeleccionado: "",
    }),

    getters: {

        todasLasReservas: (state) => {

            return state.servicios.reduce((acumulador, servicio) => {
                acumulador.push(...servicio.reservas)
                return acumulador
                
            }, [])
        }
    },

    actions: {

        asignarUsuarioStore(reservaHref, usuarioCambiado) {
            console.log('usuario cambiado', usuarioCambiado)
            const index = this.todasLasReservas.findIndex(reserva => reserva._links.self.href === reservaHref)
            this.todasLasReservas[index].username = usuarioCambiado
            console.log('Reserva cambiada',this.todasLasReservas[index] )
            console.log("Desde store asignado usuario", usuarioCambiado)
        },
        
        completarTareaStore(reservaHref) {
            const tareaActual = reservaHref.tareaAsignada
            const index = this.tareas.findIndex(tarea => tarea === reservaHref.tareaAsignada)
            reservaHref.tareaAsignada = this.tareas[index + 1]
            reservaHref.username = ""
            console.log("Siguiente tarea en store", this.tareas[index + 1])

        }
    },

})