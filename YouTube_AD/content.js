console.log(">> [content.js] RUN");

// --- async connect ---

try {
  const port = chrome.runtime.connect({ name: "myConnection" });
  port.postMessage({ type: "ready" });

  window.addEventListener("beforeunload", () => {
    try {
      port.postMessage({ type: "unload" });
      port.disconnect();
    } catch (error) {}
  });
} catch (error) {}

chrome.runtime.onMessage.addListener((e) => {
  if (e.type === "url_change") {
    timerList.forEach((t) => t && clearTimeout(t));
    isRootPage() && runRootPage();
    isWatchPage() && runWatchPage();
  }
});

// --- views ---

function runRootPage() {
  console.log(">> is root page", isRootPage());
}

function runWatchPage() {
  console.log(">> is watch page", isWatchPage());

  // -- skip video ad --
  getDOM(".html5-main-video").then((el) => {
    const video = el;

    function skip() {
      // 情景1:能点击跳过
      // 类型1
      getDOM(".ytp-ad-skip-button").then((el) => {
        el.click();
      });
      // 类型2
      getDOM(".ytp-ad-skip-button-modern").then((el) => {
        el.click();
      });
      
      // 情景2:强制看广告
      getDOM(".ytp-ad-player-overlay-instream-info").then(() => {
        try {
          video.currentTime = video.duration - 0.1;
        } catch (error) {}
      });
    }
    skip();
    video.addEventListener("playing", () => {
      skip();
      video.setAttribute("loop", true);
    });

    // -- PIP --
    // getDOM(".ytp-right-controls").then((el) => {
    //   const oldMiniBtn = el.querySelector(".ytp-miniplayer-button");
    //   const newMiniBtn = document.createElement("button");
    //   newMiniBtn.innerHTML += `<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%"><use class="ytp-svg-shadow" xlink:href="#ytp-id-21"></use><path d="M25,17 L17,17 L17,23 L25,23 L25,17 L25,17 Z M29,25 L29,10.98 C29,9.88 28.1,9 27,9 L9,9 C7.9,9 7,9.88 7,10.98 L7,25 C7,26.1 7.9,27 9,27 L27,27 C28.1,27 29,26.1 29,25 L29,25 Z M27,25.02 L9,25.02 L9,10.97 L27,10.97 L27,25.02 L27,25.02 Z" fill="#fff" id="ytp-id-21"></path></svg>`;
    //   newMiniBtn.className = "ytp-miniplayer-button ytp-button";
    //   newMiniBtn.addEventListener("click", () => {
    //     video.requestPictureInPicture();
    //   });
    //   el.insertBefore(newMiniBtn, oldMiniBtn);
    //   el.removeChild(oldMiniBtn);
    // });
  });
}

//  --- recycle ---

const timerList = new Set();

// --- utils ---

function isRootPage() {
  return window.location.pathname === "/";
}

function isWatchPage() {
  return window.location.pathname === "/watch";
}

function getDOM(target) {
  return new Promise((resolve, reject) => {
    let count = 50;
    let timer;
    function handler() {
      const dom = document.querySelector(target);
      if (dom) {
        clearInterval(timer);
        timerList.delete(timer);
        resolve(dom);
        return;
      }
      count--;
      if (count <= 0) {
        clearInterval(timer);
        timerList.delete(timer);
        reject(`'${target}' not found`);
        return;
      }
      timer = setInterval(handler, 100);
      timerList.add(timer);
    }
    handler();
  });
}

isWatchPage() && runWatchPage();
