const urls = [
  "https://gridproxy.grid.tf/stats?status=up",
  "https://gridproxy.grid.tf/stats?status=standby",
  "https://gridproxy.test.grid.tf/stats?status=up",
  "https://gridproxy.test.grid.tf/stats?status=standby",
  "https://gridproxy.dev.grid.tf/stats?status=up",
  "https://gridproxy.dev.grid.tf/stats?status=standby",
];

async function getStats(r) {
  const fetchPromises = [];

  for (let i = 0; i < urls.length; i++) {
    // eslint-disable-next-line no-undef
    fetchPromises.push(ngx.fetch(urls[i], { method: "GET", verify: false }));
  }

  try {
    const responses = await Promise.all(fetchPromises);

    const stats = await Promise.all(
      responses.map(async res => {
        if (res.status === 200) {
          const js = await res.json();
          return js;
        }
        return null;
      }),
    );

    r.headersOut["Content-Type"] = "application/json";
    r.headersOut["Content-Disposition"] = "inline";
    r.return(200, JSON.stringify(mergeStatsData(stats)), "application/json");
  } catch (error) {
    r.error(error);
    r.return(500);
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
