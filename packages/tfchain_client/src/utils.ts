function isEnvNode(): boolean {
  return (
    typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined"
  );
}

export { isEnvNode };
