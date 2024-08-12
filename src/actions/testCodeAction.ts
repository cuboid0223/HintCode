"use server";

import {
  ACCEPTED_STATUS_ID,
  IN_QUEUE_STATUS_ID,
  PROCESSING_STATUS_ID,
  WRONG_ANSWER_STATUS_ID,
} from "@/utils/const";

// https://ce.judge0.com/#statuses-and-languages-language
// js -> id: 63
const URL = `${process.env.JUDGE0_URL}/submissions?base64_encoded=true&fields=*`;

type CodeInfo = {
  userCode: string;
  expectedOutput: string;
};

const LANGUAGE_PYTHON_ID = 71; // Python (3.8.1) -> "id": 71

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
      language_id: LANGUAGE_PYTHON_ID,
      source_code: stringToBase64(userCode),
      stdin: "",
      memory_limit: "200000",
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
  const url = `${process.env.JUDGE0_URL}/submissions/${token}?base64_encoded=true`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
  };

  try {
    const fetchResult = async () => {
      const response = await fetch(url, options);
      const result = await response.json();
      const { stdout, stderr, message, compile_output, status } = result;

      if (
        status.id === IN_QUEUE_STATUS_ID ||
        status.id === PROCESSING_STATUS_ID
      ) {
        console.log(
          `Current status(${status.id}): ${status.description}. Retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 300)); // 等待1秒再重试
        return fetchResult(); // 递归调用以继续检查状态
      } else {
        const data = {
          ...result,
          stdout: base64ToString(stdout),
          stderr: base64ToString(stderr).replace(/\n/g, "<br>"),
          compile_output: base64ToString(compile_output),
          message: base64ToString(message),
        };
        console.log("data", data);
        return data;
      }
    };

    return await fetchResult();
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
