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
import Input from "../ui/input/Input.vue";
import { toast } from "../ui/toast";
import { OneTabUserDataType } from "./login";

const isDrawerOpen = ref<boolean>(false);
const showToggleGroup = ref<boolean>(false);
const toggleValue = ref<string[]>([]);
const selectAll = ref<boolean>(false);
const fileInput = ref<OneTabUserDataType>({});
const disabledTabs = ref<string[]>([]);

const handleExport = () => {
  chrome.storage.local.get("users", function (result) {
    let selectedData = {};

    toggleValue.value.forEach((item) => {
      if (result.users?.[item]) {
        selectedData = {
          ...selectedData,
          [item]: result.users?.[item],
        };
      }
    });

    if (selectedData) {
      // 轉換 users 資料為 JSON 字符串
      const jsonData = JSON.stringify(selectedData, null, 2);

      // 創建一個 Blob 文件
      const blob = new Blob([jsonData], { type: "application/json" });

      // 創建一個 URL 來下載該 Blob 文件
      const url = URL.createObjectURL(blob);

      // 使用 chrome.downloads.download 下載文件
      chrome.downloads.download({
        url: url,
        filename: "users.json",
        saveAs: true,
      });
    } else {
      console.log("No users data found in chrome.storage.local");
    }
  });
};

const handleImport = () => {
  chrome.storage.local.get("users", (result) => {
    let currentData = result.users || {};

    toggleValue.value.forEach((item) => {
      const importUsers = fileInput.value[item];

      if (importUsers) {
        currentData[item] = {
          ...currentData?.[item],
          ...importUsers,
        };
      }
    });

    chrome.storage.local.set({ users: currentData }, () => {
      toast({ title: "資料已更新" });
    });

    handleClose();
  });
};

const handleSelectFile = (event: any) => {
  const file = event.target.files[0]; // 獲取選擇的檔案

  if (file && file.type === "application/json") {
    const reader = new FileReader();

    // 當文件讀取完成後，解析為 JSON 資料
    reader.onload = (e) => {
      const fileContent = e.target?.result; // 讀取檔案內容

      // 確保內容是字串
      if (typeof fileContent === "string") {
        try {
          const parsedData: OneTabUserDataType = JSON.parse(fileContent); // 解析 JSON 字符串
          fileInput.value = parsedData; // 儲存解析後的資料
          showToggleGroup.value = true;

          // 處理 disable
          disabledTabs.value = ["dev", "uat", "staging", "prod"];
          disabledTabs.value = disabledTabs.value.filter((item) => {
            return !parsedData?.[item];
          });
          toggleValue.value = toggleValue.value.filter((item) => {
            return !disabledTabs.value.includes(item);
          });
        } catch (error) {
          console.error("Invalid JSON file:", error);
        }
      } else {
        console.error("The file content is not a valid string.");
      }
    };

    // 開始讀取文件內容
    reader.readAsText(file);
  } else {
    console.error("Please upload a valid JSON file.");
  }
};

const handleClose = () => {
  isDrawerOpen.value = false;
  resetTabs();
};

const resetTabs = () => {
  toggleValue.value = [];
  disabledTabs.value = [];
  showToggleGroup.value = false;
};

watchEffect(() => {
  if (!selectAll.value && toggleValue.value.includes("all")) {
    toggleValue.value = ["dev", "uat", "staging", "prod", "all"];
    toggleValue.value = toggleValue.value.filter(
      (item) => !disabledTabs.value.includes(item)
    );
    selectAll.value = true;
  } else if (
    selectAll.value &&
    toggleValue.value.length != 5 - disabledTabs.value.length
  ) {
    toggleValue.value = toggleValue.value.filter((item) => item !== "all");
    selectAll.value = false;
  }
});
</script>

<template>
  <Drawer v-model:open="isDrawerOpen">
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
        <Tabs
          default-value="import"
          class="w-full"
          @update:modelValue="resetTabs"
        >
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
                <div class="relative w-full max-w-sm items-center">
                  <Input
                    id="file"
                    type="file"
                    accept=".json"
                    @change="handleSelectFile"
                    class="pl-10"
                  />
                  <span
                    class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <File class="size-6 text-muted-foreground" />
                  </span>
                </div>
                <ToggleGroup
                  v-if="showToggleGroup"
                  v-model="toggleValue"
                  type="multiple"
                  class="flex flex-col content-start items-start"
                >
                  <ToggleGroupItem
                    value="dev"
                    :disabled="disabledTabs.includes('dev')"
                  >
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="dev"
                        :checked="toggleValue.includes('dev')"
                      />
                      <Label for="dev"> DEV </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="uat"
                    :disabled="disabledTabs.includes('uat')"
                  >
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="uat"
                        :checked="toggleValue.includes('uat')"
                      />
                      <Label for="uat"> UAT </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="staging"
                    :disabled="disabledTabs.includes('staging')"
                  >
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="staging"
                        :checked="toggleValue.includes('staging')"
                      />
                      <Label for="staging"> STAGING </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="prod"
                    :disabled="disabledTabs.includes('prod')"
                  >
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="prod"
                        :checked="toggleValue.includes('prod')"
                      />
                      <Label for="prod"> PROD </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all">
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="all"
                        :checked="toggleValue.includes('all')"
                      />
                      <Label for="all"> ALL </Label>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </CardContent>
              <CardFooter>
                <Button class="w-full" @click="handleImport">Import</Button>
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
                      <Checkbox
                        id="dev"
                        :checked="toggleValue.includes('dev')"
                      />
                      <Label for="dev"> DEV </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="uat">
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="uat"
                        :checked="toggleValue.includes('uat')"
                      />
                      <Label for="uat"> UAT </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="staging">
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="staging"
                        :checked="toggleValue.includes('staging')"
                      />
                      <Label for="staging"> STAGING </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="prod">
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="prod"
                        :checked="toggleValue.includes('prod')"
                      />
                      <Label for="prod"> PROD </Label>
                    </div>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="all">
                    <div class="items-top flex space-x-2">
                      <Checkbox
                        id="all"
                        :checked="toggleValue.includes('all')"
                      />
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
            <Button variant="outline" class="w-full" @click="handleClose">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
