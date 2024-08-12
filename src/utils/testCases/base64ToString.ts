const base64ToString = (str: string) => {
  // base64 encoded to decode
  if (!str) return "";
  return Buffer.from(str, "base64").toString("ascii");
};

export default base64ToString;
