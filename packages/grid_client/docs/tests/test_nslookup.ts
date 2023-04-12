import nslookup from "nslookup";

function nslook(domainName) {
    return new Promise(async (resolve, reject) => {
        nslookup(domainName).end((err, addr) => {
            console.log(err);
            if (err) reject(err);
            resolve(addr);
        });
    });
}

async function main() {
    console.log(await nslook("azmdomaincom"));
    console.log("hamada");
}
main();
