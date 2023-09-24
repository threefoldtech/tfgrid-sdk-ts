export function color(pkg: string): string {
  let color = "";

  switch (pkg) {
    case "default":
      color = "#3b3b3b";
      break;
    case "bronze":
      color = "linear-gradient(270deg, #AF6114 0%, #ffc58b 25%, #DC8E41 49.83%, #f9d1a9 77.32%, #AF6114 100%)";
      break;
    case "silver":
      color = "linear-gradient(270deg, #7d7d7d 0%, #f9f9f9 25%, #adadad 49.83%, #ffffff 77.32%, #a0a0a0 100%)";
      break;
    case "gold":
      color = "linear-gradient(270deg, #bf953f 0%, #fffce0 25%, #d7ae56 49.83%, #fffce0 77.32%, #aa771c 100%)";
      break;
    default:
      color = "#CCCCCC";
      break;
  }
  return color;
}
