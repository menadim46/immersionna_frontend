<script>
import NavBar from '@/components/navegacion/NavBar.vue';

export default {
    props: ['servicio'],
    computed: {
    },
    methods: {

        numeroReserva(url) {
            const arrayUrl = url.split("/");
            return arrayUrl[arrayUrl.length - 1]
        },
    },
}
</script>

<template>
    <div class="card">
        <div class="card-header text-center">
            <font-awesome-icon :icon="['fas', 'globe']" size="2xl" style="color: #52ad86;" class="me-5" />
            <h3 id="descripcion-servicio">
                <strong> {{ servicio.descripcion }}</strong>
            </h3>
            <h4>
                <strong>Servicio nº {{ numeroReserva(servicio._links.self.href) }}</strong>
            </h4>
            <h5 class="text-center datos-servicio">
                <strong> Fecha: {{ servicio.fechaInicio }}</strong>
            </h5>
        </div>
        <h2 id="titulo-listado" class="card-title fw-bold mt-2 text-center ">Reservas</h2>
        <li v-for="reserva in servicio.reservas" :key="reserva.id">
            <p class="datos-reserva text-center">
                {{ reserva.nombreApellidosCliente }}
            </p>
            <p id="fecha-reserva" class="text-center"> Fecha de Reserva: {{ reserva.fechaReserva }} </p>
        </li>
    </div>

</template>

<style scoped>
#reserva {
    background-color: #9ccdfd;
}

#descripcion-servicio {
    font-size: 1.8em;

}

#fecha-servicio {
    font-size: 1.2em;
    color: #003366;
}

.card-title {
    color: grey;
    font-weight: 600;
}

#nombre-cliente {
    font-weight: bold;
    font-size: 1.5em;
    color: aliceblue;
    background-color: #0062c4;
}

#titulo-listado {
    color: #003366;
}

#tarea,
#tarea-icono {
    color: rgb(0, 93, 25);
}

#boton-confirmar {
    background-color: rgb(0, 93, 25);
    color: aliceblue;
}

.container {
    display: flex;
    justify-content: center;
    max-width: 1000px;
}

#tareasPendientes {
    color: #9B121B;
    font-size: 1.3em;
}

.datos-servicio {
    font-size: 1.2em;
    color: #003366;
}

#usuario-asignado {
    font-size: 1.2em;
    color: #003366;
}

#tarea-asignada {
    font-size: 1.2em;
    color: rgb(0, 93, 25);
}

#descripcion-servicio {
    color: #003366;
}

.datos-reserva {
    color: black;
    font-weight: 600;
    font-size: 1.2em;
}

#fecha-reserva {
    color: rgb(67, 66, 66);
    font-weight: 600;
    font-size: 1.2em;
}
</style>