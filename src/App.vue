<script setup lang="ts">
import { savelogin, loadLogin } from "./components/login";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toast";
</script>

<template>
  <div class="flex flex-col place-items-center my-8 max-w-lg">
    <div class="w-full xs:w-3/4 px-4 xs:px-0">
      <loadLogin />
      <Separator class="my-6" />
      <savelogin />
    </div>
  </div>
  <Toaster />
</template>

<style scoped></style>
