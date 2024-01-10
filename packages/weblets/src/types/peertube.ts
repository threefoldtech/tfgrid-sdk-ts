import { v4 } from "uuid";

import generatePassword from "../utils/generatePassword";
import VM, { Disk } from "./vm";
const length = Math.floor(Math.random() * 5) + 10;
export default class funkwhale extends VM {
  public name = `PT${v4().split("-")[0]}`;
  public adminEmail = "";
  public adminPassword = generatePassword(length); // prettier-ignore
  public publicIp = false;
  public cpu = 2;
  public memory = 1024 * 2;
  public disks = [new Disk(undefined, undefined, 20, undefined)];
  public domain = "";

  public get valid(): boolean {
    const { name, adminEmail, adminPassword } = this;
    return name !== "" && adminEmail !== "" && adminPassword !== "";
  }
}
