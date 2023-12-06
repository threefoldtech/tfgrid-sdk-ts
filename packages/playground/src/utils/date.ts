import moment from "moment";

export default function toHumanDate(timeInSeconds: number): string {
  return moment(timeInSeconds * 1000).format("M/D/YY, h:m A");
}
