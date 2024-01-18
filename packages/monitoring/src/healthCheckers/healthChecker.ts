import { sendWithFullResponse } from "../helpers/utils";

export class HealthCheck {
  constructor(public pingUrl: string, public serviceName = "Unknown") {}
  public async alive(): Promise<boolean> {
    try {
      const response = await sendWithFullResponse("GET", this.pingUrl, "", {});
      if (response.status === 200) return true;
    } catch (e) {
      console.log(`${this.serviceName} service seems to be down!`);
      console.log(`*\tPing URL: ${this.pingUrl}`);
      console.log(`*\tError: ${e.message}`);
      return false;
    }
  }
}
