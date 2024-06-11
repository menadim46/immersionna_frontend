<script>

</script>

<template>
  <nav class="navbar navbar-expand-lg bg-azul navbar-dark">
    <div class="container-fluid">
      <router-link style="color: aliceblue;font-weight: 700;" class="nav-link ms-5 mt-2 align-items-center" to="/home">
        <img id="logoImersiona" src="/src/assets/logo_immersionna.png" alt="logo_immersionna">
        Immersionna</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon" style="color: white;"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 ">
          <li class="nav-item">
            <router-link class="nav-link ms-5" to="/listaServicios">Servicios</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link ms-5" to="/listaReservas">Reservas</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link ms-5" to="/informes">Informes</router-link>
          </li>

          <li class="nav-item">
            <router-link class="nav-link ms-5" to="/consultas">Consultas</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link ms-5" to="/clientes">Clientes</router-link>
          </li>
        </ul>
      </div>

    </div>
  </nav>


</template>

<style scoped>
.bg-azul {
  background-color: #003366;
  font-size: 1.5em;
}

* {
  color: aliceblue !important;
}

.nav-link,
.form-check-label {
  color: aliceblue;

}

.nav-link :hover {
  color: aliceblue;
  font-weight: 400;
}

#logoImersiona {
  height: 4em;
  width: 4em;
}

.nav-item.active {
  color: white;
}

.nav-item :hover {
  font-weight: 700;
  color: aliceblue;
}

.container-fluid {
  display: flex;
  text-align: center;
}

.input-group {
  align-items: end;
}
</style>
