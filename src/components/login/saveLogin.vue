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
import {
  oneTabUserDatas,
  tabProps,
  loadUsers,
  handleStorageChange,
  getUsers,
  setUsers,
  UsersDataType,
} from "./login";

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

// 將用戶資料儲存到 localStorage
const saveToLocalStorage = async () => {
  const { username, password } = inputValue.value;
  const selectedTab = props.selectedTab;
  let result = await getUsers();

  // 更新單個tab的資料
  oneTabUserDatas.value = {
    ...oneTabUserDatas.value,
    [username]: { password },
  };

  // 更新選擇的 tab 的數據，保留其他 tab
  const updatedUsers: UsersDataType = {
    ...result,
    [selectedTab]: oneTabUserDatas.value, // 這裡保留了對應 tab 的資料
  };

  await setUsers(updatedUsers);
  toast({ title: `用戶 ${username} 已被儲存！` });

  console.log("已儲存用戶資料", updatedUsers);
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
