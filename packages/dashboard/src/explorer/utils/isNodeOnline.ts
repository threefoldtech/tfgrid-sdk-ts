import { INode } from "../graphql/api";
import moment from "moment";

export default function isNodeOnline(node: INode) {
  const { updatedAt } = node;
  const startTime = moment();
  const end = moment(updatedAt);
  const hours = startTime.diff(end, "hours");
  // if updated difference in hours with now is less then 2 hours, node is up
  return hours <= 2;
}
