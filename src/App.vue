<script setup lang="ts">
import {savelogin, loadLogin} from './components/login';
</script>

<template>
  <div class="flex flex-col place-items-center">
    <loadLogin class="mb-8 mt-8"/>
    <savelogin />
  </div>
</template>

<style scoped>
</style>
