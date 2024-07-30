"use server";
// https://ce.judge0.com/#statuses-and-languages-language
// js -> id: 63
const URL = `${process.env.JUDGE0_URL}/submissions?base64_encoded=true&fields=*`;

type CodeInfo = {
  userCode: string;
  expectedOutput: string;
};
export const testUserCode = async (codeInfo: CodeInfo) => {
  // 創造新的 submission
  const { userCode, expectedOutput } = codeInfo;

  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      language_id: 71, // Python (3.8.1) -> "id": 71
      source_code: stringToBase64(userCode),
      stdin: "",
      memory_limit: "10000",
      expected_output: stringToBase64(expectedOutput),
    }),
  };

  try {
    const response = await fetch(URL, options);
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error(error);
  }
};

export const getSubmissionData = async (token: string) => {
  // 透過 token 取得 submission
  const url = `${process.env.JUDGE0_URL}/submissions/${token}?base64_encoded=true`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const { stdout, stderr, message, compile_output } = result;
    // console.log("base64ToString(stdout) ", base64ToString(stdout));
    const data = {
      ...result,
      stdout: base64ToString(stdout),
      stderr: base64ToString(stderr).replace(/\n/g, "<br>"),
      compile_output: base64ToString(compile_output),
      message: base64ToString(message),
    };
    console.log("data", data);

    return data;
  } catch (error) {
    console.error(error);
  }
};

const stringToBase64 = (str: string) => {
  if (!str) return "";
  //  Buffer.from("fuck").toString("base64"); <- 解決字串 "fuck " 與 "fuck" 不一樣(多一格空格)
  return Buffer.from(str).toString("base64");
};

const base64ToString = (str: string) => {
  // base64 encoded to decode
  if (!str) return "";
  return Buffer.from(str, "base64").toString("ascii");
};
