import { MsgCancelSendToEth, MsgSendToEth } from "../types/gravity/v1/msgs"; // Replace with your own Msg import
import { defaultRegistryTypes as defaultStargateTypes } from "@cosmjs/stargate";
import { Registry } from "@cosmjs/proto-signing";
export const myRegistry = new Registry(defaultStargateTypes);

myRegistry.register("/gravity.v1.MsgSendToEth", MsgSendToEth); // Replace with your own type URL and Msg class
myRegistry.register("/gravity.v1.MsgCancelSendToEth", MsgCancelSendToEth); // Replace with your own type URL and Msg class
