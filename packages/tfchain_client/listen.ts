import type { ApiPromise } from "@polkadot/api";

//import {Codec} from '@polkadot/types/interfaces';
import { QueryClient } from "./src/client";

async function main() {
  const cl = new QueryClient("wss://tfchain.dev.grid.tf");
  await cl.connect();
  const address = "5HHRg2nVfTXD9StGihrjHre5LhC2xVRZhBYvVqoorvsqo5F5";
  try {
    const value = await listenForEvent(cl.api, "tftBridgeModule", "MintCompleted", "target", address, mintCheck);
    // const value = await listenForEvent(
    //   cl.api,
    //   "balances",
    //   "Deposit",
    //   "who",
    //   "5EvbAkU2fMiWXGrAmnUTi4zdVNXTa9cpamnhakuQcSMYSnpT",
    //   depositCheck,
    // );
    console.log(value);
    cl.disconnect();
    return value;
  } catch (error) {
    console.log(error, "Error handdlening");
  }
}
type UnsubscribeFunction = () => void;
type validatorFunctionType = (key: string, value: string, args: object) => boolean;

function checkSection(api: ApiPromise, section: string): boolean {
  const sections = Object.keys(api.events);
  if (sections.includes(section)) {
    return true;
  } else {
    return false;
  }
}
function checkMethod(api, section, method) {
  const Methods = Object.keys(api.events[section]);
  if (Methods.includes(method)) {
    return true;
  } else return false;
}
function mintCheck(key: string, value: string, args: object): boolean {
  if (args[0][key] === value) return true;
  else return false;
}
function depositCheck(key: string, value: string, args: object): boolean {
  if (args[key] === value) return true;
  else return false;
}
/**
 *
 * @param api
 * @param section
 * @param method
 * @param key
 * @param value
 * @param validator
 * @returns
 */
async function listenForEvent(
  api: ApiPromise,
  section: string,
  method: string,
  key: string,
  value: string,
  validator: validatorFunctionType,
) {
  if (!checkSection(api, section)) {
    throw new Error(`< ${section} > is not defined on the chain`);
  }
  if (!checkMethod(api, section, method)) {
    throw new Error(`< ${method} > is not defined on  the chain under ${section}`);
  }
  return new Promise(async (resolve, reject) => {
    const unsubscribe: Codec = await api.query.system.events(events => {
      // Search for the target event
      const timeout = setTimeout(() => {
        reject("Timeout: No response within 2 minutes");
        unsubscribe();
      }, 1200000);
      for (const record of events) {
        const { event } = record;
        if (event.section === section && event.method === method) {
          console.log(`Validating...`);
          if (validator(key, value, event.data.toHuman())) {
            clearTimeout(timeout);
            resolve(event.data.toPrimitive());
            unsubscribe();
            break;
          }
        }
      }
    });
  });
}
main();

// async function listen(api) {
//   let flag = false;
//   return new Promise((resolve, reject) => {
//     const timeout = setTimeout(() => {
//       reject(new Error("Timeout: No response within 2 minutes"));
//     }, 120000);
//     if (!flag) {
//       api.query.system.events(events => {
//         // Search for the target event
//         events.forEach(record => {
//           const { event } = record;
//           if (event.section === "balances" && event.method === "Deposit") {
//             flag = true;
//             resolve(event.data);
//             clearTimeout(timeout);
//             return;
//           }
//         });
//       });
//     }
//   });
// }
// const value = await listenForEvent(cl.api, "tftBridgeModule", "MintCompleted", "target", address, mintCheck);
