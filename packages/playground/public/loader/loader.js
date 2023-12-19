/** @type { HTMLDivElement } */
const appLoaderContainer = document.querySelector(".app-loader-dialog");

/** @type { HTMLDivElement } */
const loader = document.querySelector(".app-loader");

/** @type { HTMLSpanElement } */
const msgElement = document.querySelector(".app-loader-msg");

/** @type { HTMLButtonElement} */
const refreshBtn = document.querySelector(".app-loader-refresh");

const slowConnectionTime = 60 * 1000;
const noConnectionTime = 120 * 1000;
const appLoaderContainerTime = 0.3 * 1000;
const welcomeMsgTime = (1 + appLoaderContainerTime / 1000) * 1000;

let t1 = setTimeout(function () {
  t1 = null;
  if (msgElement && msgElement.textContent) {
    msgElement.textContent = "Your connection seems to be slow, Please wait...";
  }
}, slowConnectionTime);

let t2 = setTimeout(function () {
  t2 = null;
  refreshBtn && refreshBtn.classList.add("active");
  if (msgElement) {
    msgElement.textContent = "Your connection seems to be broken, Please try again";
  }
}, noConnectionTime);

refreshBtn &&
  refreshBtn.addEventListener(
    "click",
    function () {
      window.onbeforeunload = null;
      window.location.reload();
    },
    { once: true },
  );

window.$$appLoader = () => {
  refreshBtn && refreshBtn.classList.remove("active");
  t1 && clearTimeout(t1);
  t2 && clearTimeout(t2);

  refreshBtn && refreshBtn.classList.remove("active");
  loader && loader.classList.remove("active");
  if (msgElement) {
    msgElement.textContent = "Dashboard loaded. Welcome!";
  }

  setTimeout(() => {
    if (appLoaderContainer) {
      appLoaderContainer.classList.remove("active");
      setTimeout(() => appLoaderContainer.remove(), appLoaderContainerTime);
    }
  }, welcomeMsgTime);
};
