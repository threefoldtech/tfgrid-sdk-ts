import Decimal from "decimal.js";

import { type GridClient } from "../../src";
import { TFT } from "../../src/modules/tft";
import { config, getClient } from "../client_loader";

jest.setTimeout(300000);

const mock_price = jest.fn().mockResolvedValue(0.2);

let grid: GridClient;
let tft: TFT;

beforeAll(async () => {
  grid = await getClient();
  const substrate_url = grid.getDefaultUrls(config.network).substrate;

  tft = new TFT(substrate_url);

  tft.price = mock_price;
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await grid.disconnect();
});

describe("Testing TFT module", () => {
  test("Create TFT instance in all networks.", () => {
    // Test Data
    const SUBSTRATE_DEV = "wss://tfchain.dev.grid.tf/ws";
    const SUBSTRATE_QA = "wss://tfchain.qa.grid.tf/ws";
    const SUBSTRATE_TEST = "wss://tfchain.test.grid.tf/ws";
    const SUBSTRATE_MAIN = "wss://tfchain.grid.tf/ws";

    const tft_dev = new TFT(SUBSTRATE_DEV);
    const tft_qa = new TFT(SUBSTRATE_QA);
    const tft_test = new TFT(SUBSTRATE_TEST);
    const tft_main = new TFT(SUBSTRATE_MAIN);

    expect(tft_dev).toBeInstanceOf(TFT);
    expect(tft_qa).toBeInstanceOf(TFT);
    expect(tft_test).toBeInstanceOf(TFT);
    expect(tft_main).toBeInstanceOf(TFT);
  });

  test("should convert to the correct value based on the mocked price.", async () => {
    const result = await tft.fromUSD({ usd: 5 });

    expect(mock_price).toHaveBeenCalled();
    expect(typeof result).toBe("string");
    expect(result).toBe(new Decimal(5 / 0.2).toFixed(2));
  });

  test("fromUSD function to throw if passed a negative value.", async () => {
    expect(tft.fromUSD({ usd: -1 })).rejects.toThrow();
  });

  test("toUSD function returns a valid value.", async () => {
    const usd = 1;
    const result = await tft.toUSD({ tft: usd });

    expect(typeof result).toBe("string");
    expect(result).toEqual(new Decimal(1 * 0.2).toFixed(2));
  });

  test("toUSD function to throw if passed a negative value.", async () => {
    expect(tft.toUSD({ tft: -1 })).rejects.toThrow();
  });

  test("toMonth function returns a valid value.", () => {
    const tfts = 1;
    const result = tft.toMonth({ tft: tfts });
    const expected_result = new Decimal(tfts * 24 * 30).toFixed(2);

    expect(result).resolves.toBe(expected_result);
  });

  test("toMonth function throws if passed anything other than a positive value.", () => {
    const result = tft.toMonth({ tft: -1 });

    expect(result).rejects.toThrow();
  });

  test("toYear function returns a valid value.", () => {
    const tfts = 1;
    const result = tft.toYear({ tft: tfts });
    const expected_result = new Decimal(+tft.toMonth({ tft: tfts }) * 12).toFixed(2);
    expect(result).resolves.toBe(expected_result);
  });

  test("toYear function throws if passed anything other than a positive value.", () => {
    expect(tft.toYear({ tft: -1 })).rejects.toThrow();
  });
});
