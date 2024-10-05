<script setup lang="ts">
import {savelogin, loadLogin} from './components/login';
</script>

<template>
    <div class="flex flex-col place-items-center my-8 gap-2">
      <loadLogin/>
      <savelogin />
    </div>
</template>

<style scoped>
</style>
