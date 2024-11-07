<script setup lang="ts">
import { savelogin, loadLogin, other } from "./components/login";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ref } from "vue";

const tabValue = ref("dev");
</script>

<template>
  <div class="flex flex-col place-items-center my-8 max-w-lg">
    <div class="w-full xs:w-3/4 px-4 xs:px-0">
      <Tabs v-model="tabValue" default-value="dev" class="w-full">
        <TabsList class="w-full grid grid-cols-4 mb-2">
          <TabsTrigger value="dev"> DEV </TabsTrigger>
          <TabsTrigger value="uat"> UAT </TabsTrigger>
          <TabsTrigger value="staging"> STAGING </TabsTrigger>
          <TabsTrigger value="prod"> PROD </TabsTrigger>
        </TabsList>
        <loadLogin :selected-tab="tabValue" />
        <Separator class="my-6" />
        <savelogin :selected-tab="tabValue" />
        <other />
      </Tabs>
    </div>
  </div>
  <Toaster />
</template>

<style scoped></style>
