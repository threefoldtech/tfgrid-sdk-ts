const fs = require("fs");
function updateCache(summary, path) {
  const data = {
    summary,
    updatedAt: Date.now(),
  };
  fs.writeFileSync(path, JSON.stringify(data));
}

function isLessThan24Hours(timestamp) {
  const now = Date.now();
  const difference = now - timestamp;
  const hours = 24;
  return difference < hours * 60 * 60 * 1000;
}

async function readCache(path) {
  const cache = JSON.parse(fs.readFileSync(path));
  if (cache.summary) {
    const validCache = isLessThan24Hours(cache.timestamp || undefined);
    return {
      cache,
      validCache,
    };
  }
}

export default {
  updateCache,
  readCache,
};
