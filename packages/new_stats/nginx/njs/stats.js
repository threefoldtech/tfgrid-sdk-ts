const URLS = [
  "https://gridproxy.grid.tf/stats?status=up",
  "https://gridproxy.grid.tf/stats?status=standby",
  "https://gridproxy.test.grid.tf/stats?status=up",
  "https://gridproxy.test.grid.tf/stats?status=standby",
  "https://gridproxy.dev.grid.tf/stats?status=up",
  "https://gridproxy.dev.grid.tf/stats?status=standby",
];
const DUMMY_DATA = {
  capacity: "32.74 PB",
  nodes: 2569,
  countries: 61,
  cores: 63968,
  notUpdated: true,
};

const RETRIES = 3;

function initTargeRequests(urls, r) {
  return urls.map(url =>
    //   eslint-disable-next-line no-undef
    ngx
      .fetch(url, { verify: r.headersIn["Host"].split(":")[0] !== "localhost" }) // disable ssl on localhost
      .then(res => res.json()),
  );
}
async function getStats(r) {
  let reties = 0;
  const stats = [];

  try {
    while (URLS.length !== 0 && reties < RETRIES) {
      const responses = await Promise.allSettled(initTargeRequests(URLS, r));
      const currentUrls = URLS;
      responses.forEach((item, index) => {
        if (item.status === "fulfilled") {
          URLS.splice(URLS.indexOf(currentUrls[index]), 1);
          stats.push(item.value);
        }
      });
      if (URLS.length !== 0) reties++;
    }
    let result;
    if (reties < 3) result = mergeStatsData(stats);
    else {
      r.error(`Failed to get response form ${URLS} after ${reties}; returning  DUMMY_DATA`);
      result = DUMMY_DATA;
    }
    r.headersOut["Content-Type"] = "application/json";
    r.headersOut["Content-Disposition"] = "inline";
    r.return(200, JSON.stringify(result));
  } catch (error) {
    r.error(error);
    r.headersOut["Content-Type"] = "application/json";
    r.headersOut["Content-Disposition"] = "inline";
    r.return(200, JSON.stringify(DUMMY_DATA));
  }
}

function mergeStatsData(stats) {
  const res = Object.assign({}, stats[0]);

  for (let i = 1; i < stats.length; i++) {
    if (stats[i]) {
      res.nodes += stats[i].nodes;
      res.totalCru += stats[i].totalCru;
      res.totalHru += stats[i].totalHru;
      res.totalSru += stats[i].totalSru;
      res.nodesDistribution = mergeNodeDistribution([res.nodesDistribution, stats[i].nodesDistribution]);
      res.countries = Object.keys(res.nodesDistribution).length;
    }
  }

  const result = {};
  result.capacity = toTeraOrGiga(res.totalHru + res.totalSru);
  result.nodes = res.nodes;
  result.countries = res.countries;
  result.cores = res.totalCru;

  return result;
}

function mergeNodeDistribution(stats) {
  const keys = [];
  for (let i = 0; i < stats.length; i++) {
    const obj = stats[i];
    if (obj) {
      const objKeys = Object.keys(obj);
      for (let j = 0; j < objKeys.length; j++) {
        if (!keys.includes(objKeys[j])) keys.push(objKeys[j]);
      }
    }
  }

  const result = {};
  keys.forEach(function (key) {
    result[key] = 0;
    for (let i = 0; i < stats.length; i++) {
      const country = stats[i];
      result[key] += country ? country[key] || 0 : 0;
    }
  });

  return result;
}

function toTeraOrGiga(value) {
  const giga = 1024 ** 3;

  if (!value) return "0";

  const val = +value;
  if (val === 0 || isNaN(val)) return "0";

  if (val < giga) return val.toString();

  let gb = val / giga;

  if (gb < 1024) return gb.toFixed(2) + " GB";

  gb = gb / 1024;

  if (gb < 1024) return gb.toFixed(2) + " TB";

  gb = gb / 1024;
  return gb.toFixed(2) + " PB";
}

// Exporting the main function for Nginx
export default { getStats };
