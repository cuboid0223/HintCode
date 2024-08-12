const stringToBase64 = (str: string) => {
  if (!str) return "";
  //  Buffer.from("fuck").toString("base64"); <- 解決字串 "fuck " 與 "fuck" 不一樣(多一格空格)
  return Buffer.from(str).toString("base64");
};

export default stringToBase64;
