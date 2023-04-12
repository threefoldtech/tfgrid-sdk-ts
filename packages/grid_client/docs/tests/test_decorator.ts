
function crop(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    descriptor.value = function (...args) {
        const x = args[0].split("grid3_client/");
        args[0] = x.length === 2 ? x[1] : x[0];
        method.apply(this, args);
    };
}


class Hamada {
    @crop
    get(path: string) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        console.log(path);

    }

}

const h = new Hamada();
h.get(".config/grid3_cient/testnet/82");
