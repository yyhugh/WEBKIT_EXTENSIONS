console.log(">> [background.js] RUN");

// --- async connect ---

let isReady = false;
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "myConnection") {
    port.onMessage.addListener(({ type }) => {
      console.log("type", type);
      if (type === "ready") {
        isReady = true;
      }
      if (type === "unload") {
        isReady = false;
      }
    });
  }
});

// --- main ---

const send = debounce((tabId) => {
  isReady && chrome.tabs.sendMessage(tabId, { type: "url_change" });
}, 100);

// tab change
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status) {
    send(tabId);
  }
});

// --- utils ---

function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    if (timer) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
      }, wait);
    } else {
      timer = setTimeout(() => {
        fn(...args);
      }, wait);
    }
  };
}
