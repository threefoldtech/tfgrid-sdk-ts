export default function optionTitleFiler(str: string): string {
  if (typeof str !== "string") return str;

  return str.replace(/[A-Z]/g, v => {
    return " " + v;
  });
}
