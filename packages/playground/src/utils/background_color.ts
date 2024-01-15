export function color(pkg: string): string {
  let color = "";

  switch (pkg) {
    case "default":
      color = "#74DDC3";
      break;
    case "bronze":
      color = "linear-gradient(270deg, #AF6114 0%, #ffc58b 25%, #DC8E41 49.83%, #f9d1a9 77.32%, #AF6114 100%)";
      break;
    case "silver":
      color =
        "linear-gradient(270deg, #7d7d7d 0%, #ffffff 15%, #adadad 24.83%,#ffffff 50.32%, #adadad 71.83%, #ffffff 87.32%, #a0a0a0 100%)";
      break;
    case "gold":
      color = "linear-gradient(270deg, #bf953f 0%, #fffce0 25%, #d7ae56 49.83%, #fffce0 77.32%, #aa771c 100%)";
      break;
    default:
      color = "#ffffff";
      break;
  }
  return color;
}
