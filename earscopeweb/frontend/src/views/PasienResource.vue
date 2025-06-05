<template>
    <app-layout activePage="pasienresource" data-v-inspector="src/views/PasienResource.vue">
      <router-view data-v-inspector="src/views/PasienResource.vue"></router-view>
    </app-layout>
  </template>
  
  <script>
  import AppLayout from '@/components/AppLayout.vue';

  export default {
    name: 'PasienResource',
    components: {
        AppLayout
    }
  };
  </script>