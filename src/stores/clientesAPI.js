import { defineStore } from "pinia"
import { getClientes } from "@/stores/api-service.js"

export const useClientesAPIStore = defineStore("clientesAPI", {

    state: () => ({
        clientesAPI: [],
        clientesCargadosAPI: false,

    }),

    actions: {
        async cargarClienteAPI() {
            this.clientesAPI = [];
            this.clientesAPI = false;

            try {
                const response = await getClientes();
                if (response.data._embedded && response.data._embedded.clientes) {
                    const promises = response.data._embedded.clientes.map(async (cliente) => {
                        return {
                            ...cliente,
                        };
                    });
                    this.clientesAPI = await Promise.all(promises);
                    this.reservasCargadasAPI = true
                }

            } catch (error) {
                this.clientesCargadosAPI = false;
            }
        }

    }
})