import { PropType, ref } from "vue";

export type OneTabUserDataType = { [username: string]: { password: string } };
export type UsersDataType = { [tab: string]: OneTabUserDataType };
export const oneTabUserDatas = ref<OneTabUserDataType>({});
export type LastUserType = { [tab: string]: string };

export const tabProps = {
  selectedTab: {
    type: String as PropType<string>,
    required: true,
    default: "dev",
  },
};

export const loadUsers = async (selectedTab: string) => {
  const result = await getUsers();
  oneTabUserDatas.value = result?.[selectedTab] ? result[selectedTab] : {};
};

export const handleStorageChange = (
  changes: any,
  area: string,
  selectedTab: string
) => {
  if (area === "local" && changes.users) {
    loadUsers(selectedTab);
  }
};

export const getUsers = async (): Promise<UsersDataType> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("users", (result) => {
      resolve(result.users || {});
    });
  });
};

export const setUsers = async (users: UsersDataType): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ users }, () => {
      resolve();
    });
  });
};

export const getLastUsers = async (): Promise<LastUserType> => {
  return new Promise((resolve) => {
    chrome.storage.local.get("lastUser", (result) => {
      resolve(result.lastUser || {});
    });
  });
};

export const setLastUsers = async (lastUser: LastUserType): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ lastUser }, () => {
      resolve();
    });
  });
};
