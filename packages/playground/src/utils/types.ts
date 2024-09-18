export enum IPType {
  single = "Single",
  range = "Range",
}
export enum Selection {
  AUTOMATED = "automated",
  MANUAL = "manual",
}

export interface IPublicConfig {
  ipv4: string;
  gw4: string;
  ipv6?: string;
  gw6?: string;
  domain?: string;
}

/**
 * Represents a date object with day, month, and year properties.
 *
 * @interface Date
 * @property {number} day - The day of the month (1-31).
 * @property {number} month - The month of the year (1-12).
 * @property {number} year - The year.
 */
export interface Date {
  day: number;
  month: number;
  year: number;
}

/**
 * Represents an application card with metadata and optional release date.
 *
 * @interface ApplicationCard
 * @property {string} title - The title of the application.
 * @property {string} excerpt - A brief description of the application.
 * @property {string} icon - The icon associated with the application.
 * @property {string} route - The route or URL of the application.
 * @property {string[]} [tags] - Optional list of tags or keywords for the application.
 * @property {Date} [releaseDate] - Optional release date of the application.
 */

export interface ApplicationCard {
  title: string;
  excerpt: string;
  icon: string;
  route: string;
  tags?: string[];
  releaseDate?: Date;
}
