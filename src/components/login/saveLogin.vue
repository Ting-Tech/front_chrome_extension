<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast/use-toast";

const props = defineProps({
  selectedTab: {
    type: String,
    required: true,
  },
});

watch(
  () => props.selectedTab,
  (newTab) => {
    console.log("選擇的環境變更為:", newTab);
    // 可以根據新值執行相應的操作
  }
);

const { toast } = useToast();

type UserData = { [key: string]: { password: string } };

const userDatas = ref<UserData>({});
const inputValue = ref<{ username: string; password: string }>({
  username: "",
  password: "",
});

const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(1).max(15),
    password: z.string().min(1).max(15),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const saveToLocalStorage = () => {
  const { username, password } = inputValue.value;
  userDatas.value[username] = { password };

  chrome.storage.local.get("users", (result) => {
    const currentUsers = result.users || {}; // 取得現有的 users 資料，若無則設置為空對象

    // 更新選擇的 tab 的數據，保留其他 tab
    const updatedUsers = {
      ...currentUsers,
      [props.selectedTab]: userDatas.value
    };

    // 將更新後的 users 存回 chrome.storage.local
    chrome.storage.local.set({ users: updatedUsers }, () => {
      toast({ title: `用戶 ${username} 已被儲存！` });
    });
  });
  
};

const onSubmit = handleSubmit((values) => {
  inputValue.value = values;
  saveToLocalStorage();
  inputValue.value = { username: "", password: "" };
});

// 監聽 local storage 更新
const loadUsers = () => {
  chrome.storage.local.get("users", (result) => {
    const selectedTabData = result.users?.[props.selectedTab];
    if (selectedTabData) {
      userDatas.value = selectedTabData;
    }
  });
};

const handleStorageChange = (changes: any, area: string) => {
  if (area === "local" && changes.users) {
    loadUsers();
  }
};

onMounted(() => {
  loadUsers();
  chrome.storage.onChanged.addListener(handleStorageChange);
});

onBeforeUnmount(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange);
});
</script>

<template>
  <!-- {{ userDatas }} -->
  <form class="w-full space-y-2" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="Username"
            v-bind="componentField"
            v-model="inputValue.username"
          />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            placeholder="Password"
            v-bind="componentField"
            v-model="inputValue.password"
          />
        </FormControl>
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full">Save</Button>
  </form>
</template>
