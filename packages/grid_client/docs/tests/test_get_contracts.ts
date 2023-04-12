import { getClient } from "./client_loader";

async function main() {
    const gridClient = await getClient();
    for (let i = 5000; i < 10000; i++) {
        const data = await gridClient.contracts.get({ id: i });
        if (data["contract_id"] === 0) {
            break;
        }
        if (!Object.keys(data.state).includes("deleted")) {
            try {
                if (data["contract_type"]["nodeContract"]["public_ips"]) {
                    console.log(
                        "contract_id:",
                        data["contract_id"],
                        "->",
                        "twin_id:",
                        data["twin_id"],
                        "->",
                        "number of public ips:",
                        data["contract_type"]["nodeContract"]["public_ips"],
                        "->",
                        "state:",
                        data["state"],
                    );
                }
            } catch (e) {}
        }
    }
    await gridClient.disconnect();
}
main();
