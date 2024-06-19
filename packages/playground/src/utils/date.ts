import moment from "moment";

export default function toHumanDate(timeInSeconds: number): string {
  return moment(timeInSeconds * 1000).format("MM/DD/YY, hh:mm A");
}
