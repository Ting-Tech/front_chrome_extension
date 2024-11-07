<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { Check, ChevronsUpDown } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/toast";
import { Trash } from "lucide-vue-next";
import {
  oneTabUserDatas,
  tabProps,
  loadUsers,
  handleStorageChange,
  getUsers,
  setUsers,
  setLastUsers,
  getLastUsers,
  UsersDataType,
} from "./login";

const props = defineProps(tabProps);

const formSchema = toTypedSchema(
  z.object({
    username: z.string({
      required_error: "Please select a username.",
    }),
  })
);

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: formSchema,
});

const handleDelete = async (userToDelete: string) => {
  const { [userToDelete]: _, ...remainingUsers } = oneTabUserDatas.value;

  oneTabUserDatas.value = remainingUsers;

  let currentUsers = await getUsers();

  const updatedUsers: UsersDataType = {
    ...currentUsers,
    [props.selectedTab]: oneTabUserDatas.value,
  };

  setUsers(updatedUsers);
};

const handleTabChange = async () => {
  loadUsers(props.selectedTab);
  let result = await getUsers();

  const selectedTabData = result?.[props.selectedTab];

  if (selectedTabData) {
    // 如果有上次使用者，請將第一個使用者名稱設定為上次使用者名稱
    const username = Object.keys(selectedTabData)[0];
    if (username) {
      setFieldValue("username", username);
    }
  } else {
    // 如果沒有上次使用者，請將使用者名稱設定為空字串
    const userKeys = Object.keys(oneTabUserDatas.value);
    if (userKeys.length > 0) {
      setFieldValue("username", userKeys[0]);
    }
  }
};

const handleHieldValue = async (username: string) => {
  setFieldValue("username", username);
  const currentUsers = await getLastUsers();

  const updatedUsers = {
    ...currentUsers,
    [props.selectedTab]: username,
  };

  await setLastUsers(updatedUsers);
};

const autoLogin = async (username: string) => {
  let result = await getUsers();
  const selectedTabData = result?.[props.selectedTab];

  if (selectedTabData) {
    // Ensure you're getting the password from the selected tab and user
    const user = selectedTabData[username];
    if (user) {
      const { password } = user;

      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (tab.id === undefined) {
          return;
        }

        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          args: [username, password],
          func: (username, password) => {
            const xpathUserName =
              "//div[contains(@class, 'login-form')]//form//input[@type='text']";
            const elUserName = document.evaluate(
              xpathUserName,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue as HTMLInputElement | null;
            const xpathPassword =
              "//div[contains(@class, 'login-form')]//form//input[@type='password']";
            const elPassword = document.evaluate(
              xpathPassword,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue as HTMLInputElement | null;
            const xPathLoginButton =
              "//div[contains(@class, 'login-form')]//form//button";
            const elPathLoginButton = document.evaluate(
              xPathLoginButton,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            ).singleNodeValue as HTMLButtonElement | null;
            if (elUserName) {
              elUserName.value = username;
              elUserName.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
              toast({ title: "用戶輸入框未找到" });
              console.error("用戶輸入框未找到");
            }
            if (elPassword) {
              elPassword.value = password;
              elPassword.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
              toast({ title: "密碼輸入框未找到" });
              console.error("密碼輸入框未找到");
            }
            if (elPathLoginButton) {
              elPathLoginButton.click();
            } else {
              toast({ title: "目標按鈕未找到" });
              console.error("目標按鈕未找到");
            }
          },
        });
      } catch (error) {
        console.error("注入腳本時出錯:", error);
      }
    } else {
      toast({ title: "用戶未找到" });
      console.error("用戶未找到");
    }
  }
};

const onSubmit = handleSubmit((values) => {
  autoLogin(values.username);
});

watch(
  () => props.selectedTab,
  () => {
    handleTabChange();
  }
);

onMounted(() => {
  handleTabChange();
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
  <!-- {{ oneTabUserDatas }} -->
  <form
    class="w-full flex flex-row flex-wrap xs:flex-nowrap justify-between items-end gap-2"
    @submit="onSubmit"
  >
    <FormField name="username">
      <FormItem class="flex flex-col grow">
        <FormLabel>Username</FormLabel>
        <Popover>
          <PopoverTrigger as-child>
            <FormControl class="min-w-0">
              <Button
                variant="outline"
                role="combobox"
                :class="
                  cn(
                    'justify-between',
                    !values.username && 'text-muted-foreground'
                  )
                "
              >
                {{ values.username || "Select username..." }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent class="p-0 w-full">
            <Command>
              <CommandInput placeholder="Search username..." />
              <CommandEmpty>Nothing found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="user in Object.keys(oneTabUserDatas)"
                    :key="user"
                    :value="user"
                    @select="
                      () => {
                        handleHieldValue(user);
                      }
                    "
                  >
                    <Check
                      :class="
                        cn(
                          'mr-2 h-4 w-4',
                          user === values.username ? 'opacity-100' : 'opacity-0'
                        )
                      "
                    />
                    <div
                      class="flex flex-row justify-between items-center w-full"
                    >
                      {{ user }}
                      <Button
                        variant="outline"
                        size="icon"
                        @click="() => handleDelete(user)"
                        ><Trash class="w-4 h-4"
                      /></Button>
                    </div>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormItem>
    </FormField>

    <Button type="submit" class="w-full xs:w-1/3">AutoLogin</Button>
  </form>
</template>
