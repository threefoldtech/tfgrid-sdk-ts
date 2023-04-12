async function test() {
    throw Error("e");
}


async function main() {

    await test();
}
main();
// test().then().catch(err => {
//     error(err);
// });
