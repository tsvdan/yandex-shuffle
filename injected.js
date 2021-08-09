// prettier is bad for formatting. Inconsistent and devoid of meaning.

console.log("Injected inject-me.js from the background script.");

// listen for controls changes
console.log("Listening for play-btn changes.");
let playing = false;
const playBtn = document.querySelector(
  "body > div.page-root.page-root_no-player.deco-pane-back > div.bar > div.bar__content > div.player-controls.deco-player-controls > div.player-controls__btn.deco-player-controls__button.player-controls__btn_play"
);
function playButtonCallback(mutations, observer) {
  mutations.forEach((mutation) => {
    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      playing = mutation.target.classList.contains("player-controls__btn_pause")
        ? true
        : false;
    }
  });
}
let mo_playBtn = new MutationObserver(playButtonCallback);
mo_playBtn.observe(playBtn, { attributes: true });

// append our button
let playerControlsRight = document.querySelector(
  "body > div.page-root.page-root_no-player.deco-pane-back > div.bar > div.bar__content > div.player-controls.deco-player-controls > div.player-controls__seq-controls"
);
let newBtn = document.createElement("div");
newBtn.classList = playerControlsRight.children[1].classList;
newBtn.classList.add("player-controls__btn_ext-shuffle");
newBtn.appendChild(
  (() => {
    let icon = document.createElement("div");
    icon.className = "d-icon d-icon_ext-shuffle";
    return icon;
  })()
);
playerControlsRight.appendChild(newBtn);

// button manages shuffleOn
let shuffleOn = false;
newBtn.addEventListener("click", () => {
  shuffleOn = !shuffleOn;
  newBtn.firstChild.classList.toggle("d-icon_ext-shuffle-gold");
});

newBtn.addEventListener("click", function injectShuffle() {
  console.log("injecting shuffle");
  newBtn.removeEventListener("click", injectShuffle);

  let script = document.createElement("script");
  script.type = "text/javascript";
  script.className = "yandex-shuffle";
  script.textContent = `
    const n = externalAPI.getTracksList().length;
    const shuffledIdx = shuffle([...Array(n).keys()]);
    let currentIdx = 0;

    function shuffle(arr) {
      for (i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      return arr;
    }

    function play(idx) {
      externalAPI.play(shuffledIdx[idx]);
    }

    function modulo(a, n) {
        return ((a % n) + n) % n
    }
    
    function next() {
        currentIdx = modulo(currentIdx + 1, n);
        play(currentIdx);
    }

    function prev() {
        currentIdx = modulo(currentIdx - 1, n);
        play(currentIdx);
    }
`;
  document.head.appendChild(script);
});

// Track changes <=> trackContainer changes
let trackContainer = document.querySelector(
  "body > div.page-root.page-root_no-player.deco-pane-back > div.bar > div.bar__content > div.player-controls.deco-player-controls > div.player-controls__track-container"
);
let ignoreMutation = false;
function trackContainerCallback(mutations) {
  mutations.forEach((mutation) => {
    if (
      mutation.type === "childList" &&
      mutation.addedNodes.length > 0 &&
      !ignoreMutation
    ) {
      if (shuffleOn) {
        ignoreMutation = true;

        let script = document.createElement("script");
        script.className = "yandex-shuffle-play";
        script.textContent = `
            next();
        `;
        let lastChild = document.head.lastChild;
        if (lastChild.className === "yandex-shuffle-play") {
          lastChild.remove();
        }
        document.head.appendChild(script);

        setTimeout(() => {
          ignoreMutation = false;
        }, 2000);
      }
    }
  });
}

let mo_trackContainer = new MutationObserver(trackContainerCallback);
mo_trackContainer.observe(trackContainer, { childList: true });

let prevBtn = document.querySelector(
  "body > div.page-root.page-root_no-player.deco-pane-back > div.bar > div.bar__content > div.player-controls.deco-player-controls > div.player-controls__btn.deco-player-controls__button.player-controls__btn_prev"
);
prevBtn.addEventListener("click", () => {
  if (shuffleOn) {
    ignoreMutation = true;

    let script = document.createElement("script");
    script.className = "yandex-shuffle-play";
    script.textContent = `
                    prev();
                `;
    let lastChild = document.head.lastChild;
    if (lastChild.className === "yandex-shuffle-play") {
      lastChild.remove();
    }
    document.head.appendChild(script);

    setTimeout(() => {
      ignoreMutation = false;
    }, 2000);
  }
});

let nextBtn = document.querySelector(
  "body > div.page-root.page-root_no-player.deco-pane-back > div.bar > div.bar__content > div.player-controls.deco-player-controls > div.player-controls__btn.deco-player-controls__button.player-controls__btn_next"
);
nextBtn.addEventListener("click", () => {
  if (shuffleOn) {
    ignoreMutation = true;

    let script = document.createElement("script");
    script.className = "yandex-shuffle-play";
    script.textContent = `
                      next();
                  `;
    let lastChild = document.head.lastChild;
    if (lastChild.className === "yandex-shuffle-play") {
      lastChild.remove();
    }
    document.head.appendChild(script);

    setTimeout(() => {
      ignoreMutation = false;
    }, 2000);
  }
});
//
//
//
//
//

// Styles last.
let customStyles = document.createElement("style");
customStyles.textContent = `
    .d-icon_ext-shuffle.d-icon_ext-shuffle-gold {
        color: rgb(230, 155, 20);
        background-image: url(${chrome.extension.getURL(
          "assets/shuffleBright.svg"
        )});
    }
    .d-icon_ext-shuffle {
      background-image: url(${chrome.extension.getURL(
        "assets/shuffleDark.svg"
      )});
    }
`;
document.head.appendChild(customStyles);
