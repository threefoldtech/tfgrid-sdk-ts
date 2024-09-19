import moment from "moment";

export default function toHumanDate(timeInSeconds: number): string {
  return moment(timeInSeconds * 1000).format("DD MMM YYYY, hh:mm A");
}

/**
 * Checks if the provided date is within the last 30 days.
 *
 * @param {Date} date - The date to check.
 * @returns {boolean} True if the date is within the last 30 days, false otherwise.
 *
 * @description
 * This function calculates the difference in days between the provided date and the current date.
 * It then checks if this difference is less than or equal to 30 days.
 *
 * @example
 * const date = new Date('2022-01-01');
 * console.log(thirtyDaysInMilliseconds(date)); // Output: true or false depending on the current date
 */

export function thirtyDaysInMilliseconds(date: Date): boolean {
  const releaseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const currentDate = new Date();
  const next30Days = 24 * 60 * 60 * 1000;

  const diff = Math.abs((currentDate.getTime() - releaseDate.getTime()) / next30Days);
  return diff <= 30;
}
