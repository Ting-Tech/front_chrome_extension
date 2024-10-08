<script setup lang="ts">
import {savelogin, loadLogin} from './components/login';
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toast'
</script>

<template>
    <div class="flex flex-col place-items-center my-8">
      <div class="w-2/3">
        <loadLogin/>
        <Separator class="my-8"/>
        <savelogin />
      </div>
    </div>
    <Toaster/>
</template>

<style scoped>
</style>
