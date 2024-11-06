<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
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
import { defineProps } from "vue";
import { userDatas, tabProps, loadUsers, handleStorageChange } from "./login";

// 定義 tab 的 props
const props = defineProps(tabProps);
// 彈窗提示
const { toast } = useToast();
// 定義輸入框的值
const inputValue = ref<{ username: string; password: string }>({
  username: "",
  password: "",
});

// 定義表單驗證規則
const formSchema = toTypedSchema(
  z.object({
    username: z.string().min(1).max(15),
    password: z.string().min(1).max(15),
  })
);

// 使用 useForm 來處理表單驗證
const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

// 儲存用戶資料到 local storage
const saveToLocalStorage = () => {
  const { username, password } = inputValue.value;
  const selectedTab = props.selectedTab;

  // 根據 selectedTab 儲存對應的用戶資料
  userDatas.value[selectedTab] = {
    ...userDatas.value[selectedTab],
    [username]: { password },
  };

  chrome.storage.local.get("users", (result) => {
    const currentUsers = result.users || {}; // 取得現有的 users 資料，若無則設置為空對象

    // 更新選擇的 tab 的數據，保留其他 tab
    const updatedUsers = {
      ...currentUsers,
      [selectedTab]: userDatas.value[selectedTab], // 這裡保留了對應 tab 的資料
    };

    chrome.storage.local.set({ users: updatedUsers }, () => {
      // 儲存更新後的資料
      toast({ title: `用戶 ${username} 已被儲存！` });
    });

    console.log("已儲存用戶資料", updatedUsers);
  });
};

// 表單提交時的處理函數
const onSubmit = handleSubmit((values) => {
  inputValue.value = values;
  saveToLocalStorage();
  inputValue.value = { username: "", password: "" };
});

onMounted(() => {
  loadUsers(props.selectedTab);
  chrome.storage.onChanged.addListener((changes, area) => {
    handleStorageChange(changes, area, props.selectedTab);
  });
});

onBeforeUnmount(() => {
  chrome.storage.onChanged.removeListener((changes, area) => {
    handleStorageChange(changes, area, props.selectedTab);
  });
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
