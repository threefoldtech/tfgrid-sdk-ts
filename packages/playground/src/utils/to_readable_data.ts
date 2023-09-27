import moment from "moment";

const formatTimeUnit = (unit: string, value: number) => (value > 0 ? `${value} ${unit}${value === 1 ? "" : "s"}` : "");

export default function toReadableDate(timeInSeconds: number): string {
  if (timeInSeconds === 0) {
    return "No time";
  }

  const duration = moment.duration(timeInSeconds * 1000);
  const years = duration.years();
  const months = duration.months();
  const days = duration.days();

  const dateParts = [
    formatTimeUnit("year", years),
    formatTimeUnit("month", months),
    formatTimeUnit("day", days),
  ].filter(Boolean);

  if (dateParts.length === 0) {
    return "Less than a day";
  }

  return dateParts.join(" and ");
}
