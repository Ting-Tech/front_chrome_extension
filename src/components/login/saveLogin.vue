<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// 明確定義 userDatas 的類型
type UserData = { [key: string]: { password: string } }; // 修改為物件形式

const userDatas = ref<UserData>({}); // 用來存儲用戶資料的物件
const inputValue = ref<{ username: string; password: string }>({ username: '', password: '' }); // 使用對象來存儲 username 和 password

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(50), // 你可以根據需要調整密碼的驗證條件
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const saveToLocalStorage = () => {
  // 將 inputValue 複製到 userDatas 中
  userDatas.value[inputValue.value.username] = { password: inputValue.value.password };
  console.log('userDatas:', userDatas.value);
  chrome.storage.local.set({ users: userDatas.value }, () => {
    console.log('Value saved to localStorage:', userDatas.value);
    alert('資料已儲存！');
  });
};

const onSubmit = handleSubmit((values) => {
  inputValue.value = values; // 保存表單中的 username 和 password 到 inputValue
  saveToLocalStorage(); // 在提交後保存到 local storage
});

onMounted(() => {
  chrome.storage.local.get(['users'], async (result) => {
    console.log('Value retrieved from localStorage:', result.users);
    if (result.users) {
      userDatas.value = result.users; // 從 localStorage 讀取的值
      console.log('從 localStorage 讀取的值:', result.users);
    }
  });
});
</script>

<template>
  <!-- {{ userDatas }} -->
  <form class="w-2/3 space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" placeholder="username" v-bind="componentField" v-model="inputValue.username" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="password" v-bind="componentField" v-model="inputValue.password" />
        </FormControl>
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full">Save</Button>
  </form>
</template>
