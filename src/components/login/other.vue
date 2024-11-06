<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { File } from "lucide-vue-next";
import { ref, watchEffect } from "vue";

const toggleValue = ref<string[]>([]);
const selectAll = ref<boolean>(false);

const handleExport = () => {
  chrome.storage.local.get("users", function(result) {
    let selectedData = {};
  
    toggleValue.value.forEach((item) => {
      if (result.users?.[item]) {
        selectedData = {
          ...selectedData,
          [item]: result.users?.[item]
        };
      }
    });

    console.log(selectedData);

    if (selectedData) {
      // 轉換 users 資料為 JSON 字符串
      const jsonData = JSON.stringify(selectedData, null, 2);

      // 創建一個 Blob 文件
      const blob = new Blob([jsonData], { type: 'application/json' });

      // 創建一個 URL 來下載該 Blob 文件
      const url = URL.createObjectURL(blob);

      // 使用 chrome.downloads.download 下載文件
      chrome.downloads.download({
        url: url,
        filename: 'users.json',
        saveAs: true
      });
    } else {
      console.log('No users data found in chrome.storage.local');
    }
  });
}

watchEffect(() => {
  // if (toggleValue.value.length != 5) {
  //   toggleValue.value = toggleValue.value.filter((item) => item !== 'all');
  // }
  if (!selectAll.value && toggleValue.value.includes('all')) {
    toggleValue.value = ['dev', 'uat', 'staging', 'prod', 'all'];
    selectAll.value = true;
  }
  else if (selectAll.value && toggleValue.value.length != 5) {
    toggleValue.value = toggleValue.value.filter((item) => item !== 'all');
    selectAll.value = false;
  }

  console.log(toggleValue.value);
});

</script>

<template>
  <Drawer>
    <DrawerTrigger as-child>
      <Button variant="secondary" class="w-full mt-2"> Other </Button>
    </DrawerTrigger>
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm">
        <DrawerHeader>
          <DrawerTitle>Other operation</DrawerTitle>
          <DrawerDescription>
            All the other operation will be here
          </DrawerDescription>
        </DrawerHeader>
        <Tabs default-value="share" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="import"> Import </TabsTrigger>
            <TabsTrigger value="export"> Export </TabsTrigger>
          </TabsList>
          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import</CardTitle>
                <CardDescription> Import the select data here </CardDescription>
              </CardHeader>
              <CardContent class="space-y-2">
                <div class="flex flex-row items-center">
                  <Button variant="ghost" size="icon"><File /></Button>
                  <Label for="select"> Select a file </Label>
                </div>
                <ToggleGroup
                  type="multiple"
                  class="flex flex-col content-start items-start"
                >
                  <ToggleGroupItem value="dev">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="dev" />
                      <Label for="dev"> DEV </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="uat">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="uat" />
                      <Label for="uat"> UAT </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="staging">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="staging" />
                      <Label for="staging"> STAGING </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="prod">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="prod" />
                      <Label for="prod"> PROD </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="all" />
                      <Label for="all"> ALL </Label>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
              <CardFooter>
                <Button class="w-full">Import</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export</CardTitle>
                <CardDescription> Export the select data here </CardDescription>
              </CardHeader>
              <CardContent class="space-y-2">
                <ToggleGroup
                  v-model="toggleValue"
                  type="multiple"
                  class="flex flex-col content-start items-start"
                >
                  <ToggleGroupItem value="dev">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="dev" :checked="toggleValue.includes('dev')" />
                      <Label for="dev"> DEV </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="uat">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="uat" :checked="toggleValue.includes('uat')" />
                      <Label for="uat"> UAT </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="staging">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="staging" :checked="toggleValue.includes('staging')" />
                      <Label for="staging"> STAGING </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="prod">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="prod" :checked="toggleValue.includes('prod')" />
                      <Label for="prod"> PROD </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all">
                    <div class="items-top flex space-x-2">
                      <Checkbox id="all" :checked="toggleValue.includes('all')"/>
                      <Label for="all"> ALL </Label>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
              <CardFooter>
                <Button class="w-full" @click="handleExport">Export</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        <DrawerFooter>
          <DrawerClose as-child>
            <Button variant="outline" class="w-full"> Close </Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
