import moment from "moment";

import { type Date } from "./types";
export default function toHumanDate(timeInSeconds: number): string {
  return moment(timeInSeconds * 1000).format("DD MMM YYYY, hh:mm A");
}

export function isReleasedOverMon(date: Date): boolean {
  const releaseDate = new Date(date.year, date.month - 1, date.day);
  const currentDate = new Date();
  const next30Days = 24 * 60 * 60 * 1000;

  const diff = Math.abs((currentDate.getTime() - releaseDate.getTime()) / next30Days);
  return diff <= 30;
}
