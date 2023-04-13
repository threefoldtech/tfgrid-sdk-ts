export function checkKeplr(): Promise<any> {
  return new Promise((res, rej) => {
    function _checkKeplr() {
      if (window.keplr) res(window.keplr);
      else if (document.readyState == "complete") {
        rej(new Error("Keplr is not installed."));
      } else {
        setTimeout(_checkKeplr, 500);
      }
    }
    _checkKeplr();
  });
}
