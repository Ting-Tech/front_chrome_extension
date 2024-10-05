<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
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

type UserData = { [key: string]: { password: string } };

const userDatas = ref<UserData>({});
const inputValue = ref<{ username: string; password: string }>({ username: '', password: '' });

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(6).max(50),
}));

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const saveToLocalStorage = () => {
  userDatas.value[inputValue.value.username] = { password: inputValue.value.password };
  console.log('userDatas:', userDatas.value);
  chrome.storage.local.set({ users: userDatas.value }, () => {
    console.log('Value saved to localStorage:', userDatas.value);
    alert('資料已儲存！');
  });
};

const onSubmit = handleSubmit((values) => {
  inputValue.value = values;
  saveToLocalStorage();
  inputValue.value = { username: '', password: '' };
});

// 監聽 local storage 更新
const loadUsers = () => {
  chrome.storage.local.get("users", (result) => {
    if (result.users) {
      userDatas.value = result.users;
    }
  });
};

const handleStorageChange = (changes: any, area: string) => {
    if (area === 'local' && changes.users) {
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
  <form class="w-2/3 space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" placeholder="Username" v-bind="componentField" v-model="inputValue.username" />
        </FormControl>
      </FormItem>
    </FormField>
    <FormField v-slot="{ componentField }" name="password">
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="Password" v-bind="componentField" v-model="inputValue.password" />
        </FormControl>
      </FormItem>
    </FormField>
    <Button type="submit" class="w-full">Save</Button>
  </form>
</template>
