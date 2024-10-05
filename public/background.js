// background.js

// 監聽來自彈出窗口的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'injectScript') {
        const { tabId, value } = message.payload;
        injectScript(tabId, value)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Script injection failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        // 需要返回 true 以保持通訊通道開啟，等待異步回應
        return true;
    }
});

// 注入腳本的函數
async function injectScript(tabId, value) {
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        args: [value],
        func: (val) => {
            // 使用 XPath 查找目標輸入框
            const xpath = "//div[contains(@class, 'login-form')]//form//input[@type='text']";
            const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            if (el) {
                el.value = val;
                el.dispatchEvent(new Event("input", { bubbles: true }));
            } else {
                console.error("目標輸入框未找到");
            }
        },
    });
}
