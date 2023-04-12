import { default as urlParser } from "url-parse";

import { getClient } from "../client_loader";

async function main() {
    const grid3 = await getClient();
    const urls = grid3.getDefaultUrls(grid3.clientOptions.network);
    const relay = urlParser(urls.relay).hostname;
    const res = await grid3.tfchain.create({
        relay: relay,
        name: "newacc",
    });
    console.log(res);
    await grid3.disconnect();
}

main();
