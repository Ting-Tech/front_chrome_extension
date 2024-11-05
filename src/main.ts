import { createApp } from "vue";
import "./assets/index.pcss";
import App from "./App.vue";

function applySystemTheme() {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (prefersDarkScheme.matches) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // 監聽系統主題變更事件
  prefersDarkScheme.addEventListener("change", (event) => {
    if (event.matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  });
}

// 初次載入時應用系統主題
applySystemTheme();

createApp(App).mount("#app");
