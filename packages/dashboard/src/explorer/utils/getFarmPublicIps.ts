import { IFarm } from "../graphql/api";

export default function getFarmPublicIPs(farm: IFarm): IFarm {
  const ips = farm.publicIPs;
  const total = ips.length;
  const used = ips.filter(x => x.contractId === 0).length;
  return {
    ...farm,
    totalPublicIp: total,
    usedPublicIp: used,
    freePublicIp: total - used,
  };
}
