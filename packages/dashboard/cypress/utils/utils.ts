class Utils {
  formatBytes(bytes, decimals = 2) {
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  }
}

export default new Utils();
