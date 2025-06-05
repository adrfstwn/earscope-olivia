<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header v-if="$route.name != 'login'">
  <header v-if="$route.name != 'register'"></header>
  <div class="container-fluid">
  </div>
  </header>
  

  <RouterView />
</template>

<style scoped>

</style>
