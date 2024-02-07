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

const DUMMY_DATA = {
  capacity: "32.74 PB",
  nodes: 2569,
  countries: 61,
  cores: 63968,
};
function readCache(path) {
  try {
    const cache = JSON.parse(fs.readFileSync(path));
    if (cache.summary) {
      const validCache = isLessThan24Hours(cache.timestamp || undefined);
      return {
        summary: cache.summary,
        valid: validCache,
      };
    } else throw "Invalid cache";
  } catch (error) {
    return {
      summary: DUMMY_DATA,
      valid: false,
      error,
    };
  }
}

export default {
  updateCache,
  readCache,
};
