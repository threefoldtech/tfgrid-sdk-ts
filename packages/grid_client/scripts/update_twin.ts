import { getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-non-null-assertion
    const urls = grid3.getDefaultUrls(grid3.clientOptions?.network!);
    const relay = urls.relay.slice(6);

    const data = await grid3.twins.update({ relay });
    log(data);
    grid3.disconnect();
}

main();
