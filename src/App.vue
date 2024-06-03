<script>
import NavBar from "@/components/navegacion/NavBar.vue"
import Footer from "@/components/navegacion/Footer.vue"

export default {
  components: { NavBar, Footer },
}

</script>

<template>
  <div class="app-container">
    <NavBar></NavBar>
    <main>
      <router-view></router-view>
    </main>
    <Footer></Footer>

  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>