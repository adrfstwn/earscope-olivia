<template>
    <app-layout activePage="dokterresource" data-v-inspector="src/views/DokterResource.vue">
      <router-view data-v-inspector="src/views/DokterResource.vue"></router-view>
    </app-layout>
  </template>
  
  <script>
  import AppLayout from '@/components/AppLayout.vue';
  
  export default {
    name: 'DokterResource',
    components: {
      AppLayout
    }
  };
  </script>