import { HealthCheck } from "./healthChecker";

export class GridProxyHealthCheck extends HealthCheck {
  constructor(public pingUrl: string) {
    super(pingUrl, "GridProxy");
  }
}
