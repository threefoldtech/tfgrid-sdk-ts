const gte = (v: number) => (n: number) => n >= v;

const MIN = 60;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const isYear = gte(YEAR);
const isMonth = gte(MONTH);
const isWeek = gte(WEEK);
const isDay = gte(DAY);
const isHour = gte(HOUR);
const isMin = gte(MIN);

const calc = (t: number, unit: number) => (t - (t % unit)) / unit;

export default function secondToRedable(time?: number) {
  if (time != 0 && !time) return "Unknown";

  let t = +time;
  if (t === 0 || isNaN(t)) return "0";

  const units = {
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    mins: 0,
    seconds: 0,
  };

  const take = (v: number) => (t -= v);
  const takeIf = (fn: any, key: keyof typeof units, v: number) => {
    if (fn(t)) {
      units[key] = calc(t, v);
      take(units[key] * v);
    }
  };

  takeIf(isYear, "years", YEAR);
  takeIf(isMonth, "months", MONTH);
  takeIf(isWeek, "weeks", WEEK);
  takeIf(isDay, "days", DAY);
  takeIf(isHour, "hours", HOUR);
  takeIf(isMin, "mins", MIN);
  units["seconds"] = t;

  const keyToUnit = (key: string, v: number) => {
    return v + " " + key[0].toUpperCase() + key.slice(1, key.length - 1) + (v > 1 ? "s" : "");
  };
  const keys = Object.keys(units) as Array<keyof typeof units>;
  let res = "";

  for (const key of keys) {
    if (units[key] === 0) continue;

    if (res.length > 0) {
      res += ", " + keyToUnit(key, units[key]);
      return res;
    }

    res += keyToUnit(key, units[key]);
  }

  return res;
}
