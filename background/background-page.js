const extId = chrome.runtime.id;
console.log(extId);

let tabs;

// Mess
// chrome.tabs.getAllInWindow((tArr) => {
//   tabs = tArr.filter((tab) => tab.url.startsWith("https://music.yandex."));
// });

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  if (request.message === "done-loading") {
    chrome.tabs.executeScript({
      file: "injected.js",
    });
  }
});

/* For messages from code injected into the webpage */

/* DEBUG */
chrome.runtime.onMessage.addListener((request, sender, callback) => {
  console.group("onMessage");
  console.debug({ request });
  console.debug({ sender });
  console.groupEnd();
});

chrome.runtime.onMessageExternal.addListener((request, sender, callback) => {
  console.group("onMessageExternal");
  console.debug({ request });
  console.debug({ sender });
  console.groupEnd();
});
