import { defineStore } from "pinia"
import { getClientes, postCliente, putCliente } from "@/stores/api-service.js"

export const useClientesAPIStore = defineStore("clientesAPI", {

    state: () => ({
        clientesAPI: [],
        clientesCargadosAPI: false,
        respuestaClienteCreado: ''

    }),

    actions: {
        async cargarClienteAPI() {
            this.clientesAPI = []
            this.clientesCargadosAPI = false
            try {
                const response = await getClientes()
                if (response.data._embedded && response.data._embedded.clientes) {
                    const promises = response.data._embedded.clientes.map(async (cliente) => {
                        return {
                            ...cliente,
                        };
                    });
                    this.clientesAPI = await Promise.all(promises);
                    this.clientesCargadosAPI = true
                }
                return response
            } catch (error) {
                console.error('Error al cargar los clientes:', error)
                this.clientesCargadosAPI = false;
            }
        },
        async crearCliente(clienteNuevo) {
            try {
                let responseCliente = await postCliente(clienteNuevo)

                if (responseCliente.status === 201) {
                    const clienteAgregado = { ...clienteNuevo }
                    this.clientesAPI.push(clienteAgregado)
                    this.clientesCargadosAPI = true
                } else {
                    console.error('La respuesta no es 200', responseCliente)
                }
                this.respuestaClienteCreado = responseCliente.data
                console.log('respuesta de clientesAPI despues de crear', this.respuestaClienteCreado)
                return responseCliente.data
            } catch (error) {
                console.error('Error al crear el cliente:', error)
                throw error;
            }
        },

        async actualizarDatosCliente(referenciaCliente, nuevoCliente) {
            try {
                const index = this.clientesAPI.findIndex(cliente => cliente._links.self.href === referenciaCliente)
                if (index !== -1) {
                    this.clientesAPI[index] = { ...this.clientesAPI[index], ...nuevoCliente }
                    await putCliente(referenciaCliente, nuevoCliente)
                    this.clientesCargadosAPI = true
                }
            } catch (error) {
                console.error("Error al actualizar servicio: ", error)
            }

        },
    }

}

)