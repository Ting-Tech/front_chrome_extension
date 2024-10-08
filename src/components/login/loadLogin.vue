<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

import { Check, ChevronsUpDown } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from '@/components/ui/toast';
import { Trash } from 'lucide-vue-next';

const users = ref<{ [key: string]: { password: string } }>({});

const formSchema = toTypedSchema(z.object({
  username: z.string({
    required_error: 'Please select a username.',
  }),
}));

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
});

const loadFromLocalStorage = async (username: string) => {
  chrome.storage.local.get("users", async (result) => {
    if (result.users && result.users[username]) {
      const { password } = result.users[username];
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab.id === undefined) {
          return;
        }

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [username, password],
          func: (username, password) => {
            const xpathUserName = "//div[contains(@class, 'login-form')]//form//input[@type='text']";
            const elUserName = document.evaluate(xpathUserName, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement | null;
            const xpathPassword = "//div[contains(@class, 'login-form')]//form//input[@type='password']";
            const elPassword = document.evaluate(xpathPassword, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement | null;
            const xPathLoginButton = "//div[contains(@class, 'login-form')]//form//button";
            const elPathLoginButton = document.evaluate(xPathLoginButton, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLButtonElement | null;
            if (elUserName) {
              elUserName.value = username;
              elUserName.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
              toast({title: '用戶輸入框未找到',});
              console.error("用戶輸入框未找到");
            }
            if (elPassword) {
              elPassword.value = password;
              elPassword.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
              toast({title: '密碼輸入框未找到',});
              console.error("密碼輸入框未找到");
            }
            if (elPathLoginButton) {
              elPathLoginButton.click();
            } else {
              toast({title: '目標按鈕未找到',});
              console.error("目標按鈕未找到");
            }
          },
        });

      } catch (error) {
        console.error('注入腳本時出錯:', error);
      }
    } else {
    }
  });
};

const onSubmit = handleSubmit((values) => {
  loadFromLocalStorage(values.username);
});

const handleDelete = (userToDelete: string) => {
  const { [userToDelete]: _, ...newUsers } = users.value;

  users.value = newUsers;

  chrome.storage.local.set({ users: newUsers }, () => {
    toast({title: `用戶 ${userToDelete} 已被刪除！`,});
  });
};

// 監聽 local storage 更新
const loadUsers = () => {
  chrome.storage.local.get("users", (result) => {
    if (result.users) {
      users.value = result.users;
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
  <!-- {{ users }} -->
  <form class="w-full flex flex-row justify-between items-end" @submit="onSubmit">
    <FormField name="username">
      <FormItem class="flex flex-col">
        <FormLabel>Username</FormLabel>
        <Popover>
          <PopoverTrigger as-child>
            <FormControl>
              <Button
                variant="outline"
                role="combobox"
                :class="cn('w-[200px] justify-between', !values.username && 'text-muted-foreground')"
              >
                {{ values.username || 'Select username...' }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent class="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search username..." />
              <CommandEmpty>Nothing found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="user in Object.keys(users)"
                    :key="user"
                    :value="user"
                    @select="() => {
                      setFieldValue('username', user)
                    }"
                  >
                    <Check
                      :class="cn('mr-2 h-4 w-4', user === values.username ? 'opacity-100' : 'opacity-0')"
                    />
                    <div class="flex flex-row justify-between items-center w-full">
                      {{ user }}
                      <Button variant="outline" size="icon" @click="() => handleDelete(user)"><Trash class="w-4 h-4"/></Button>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormItem>
    </FormField>

    <Button type="submit">
      AutoLogin
    </Button>
  </form>
</template>
