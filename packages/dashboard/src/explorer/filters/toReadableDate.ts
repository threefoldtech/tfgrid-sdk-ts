import moment from "moment";

export default function toReadableDate(timeInSeconds: number): string {
  const duration = moment.duration(timeInSeconds * 1000);
  const years = duration.years();
  const months = duration.months();
  const weeks = duration.weeks();
  const days = duration.days();
  const _ = (k: string, n: number) => (n > 0 ? `${n} ${k}${n === 1 ? "" : "s"}` : "");
  return [_("year", years), _("month", months), _("week", weeks), _("day", days)].join(", ");
}
