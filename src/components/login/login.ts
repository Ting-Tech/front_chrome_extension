import { PropType, ref } from "vue";

export type UserDataType = {
  [tab: string]: {
    [username: string]: { password: string };
  };
};
export const userDatas = ref<UserDataType>({});

export const tabProps = {
  selectedTab: {
    type: String as PropType<string>,
    required: true,
    default: "dev",
  },
};

// 監聽 local storage 更新
export const loadUsers = (selectedTab: string) => {
  chrome.storage.local.get("users", (result) => {
    const selectedTabData = result.users?.[selectedTab];
    if (selectedTabData) {
      userDatas.value = selectedTabData;
    }
  });
};

// 監聽 local storage 變化
export const handleStorageChange = (
  changes: any,
  area: string,
  selectedTab: string
) => {
  if (area === "local" && changes.users) {
    loadUsers(selectedTab);
  }
};
