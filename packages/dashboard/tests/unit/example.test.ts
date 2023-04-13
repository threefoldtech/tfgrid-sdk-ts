import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "dotenv";

function starter(): string {
  const env = parse(readFileSync(resolve(process.cwd() + "/src", ".env")));
  return env.APP_NETWORK;
}

test("Check the selected network", () => {
  const network: string[] = ["dev", "qa", "test", "main"];

  expect(network).toContain(starter());
});
