"use server";

import { Languages } from "@/types/global";
import {
  DEFAULT_LANGUAGE_ID,
  IN_QUEUE_STATUS_ID,
  LANGUAGE_IDS,
  LANGUAGE_PYTHON_ID,
  PROCESSING_STATUS_ID,
} from "@/utils/const";
import base64ToString from "@/utils/testCases/base64ToString";
import stringToBase64 from "@/utils/testCases/stringToBase64";

type CodeInfo = {
  userCode: string;
  expectedOutput: string;
  selectedLang: Languages;
};

const JUDGE0_URL = process.env.JUDGE0_URL;
const API_KEY = process.env.X_RAPIDAPI_KEY;
const RETRY_DELAY_MS = 300; // 等待重試的時間
const HEADERS = {
  "content-type": "application/json",
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
};

export const submitUserCodeForTesting = async (codeInfo: CodeInfo) => {
  // 創造新的 submission
  const { userCode, expectedOutput, selectedLang } = codeInfo;

  const options = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      language_id: LANGUAGE_IDS[selectedLang] || DEFAULT_LANGUAGE_ID,
      source_code: stringToBase64(userCode),
      stdin: "",
      memory_limit: "10000",
      expected_output: stringToBase64(expectedOutput),
    }),
  };

  try {
    const response = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=true&fields=*`,
      options
    );
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error("Failed to submit user code:", error);
    throw error;
  }
};

export const getSubmissionData = async (token: string) => {
  const url = `${JUDGE0_URL}/submissions/${token}?base64_encoded=true`;

  try {
    const fetchSubmissionResult = async () => {
      const response = await fetch(url, { method: "GET", headers: HEADERS });
      const result = await response.json();
      const { stdout, stderr, message, compile_output, status } = result;

      if (
        status.id === IN_QUEUE_STATUS_ID ||
        status.id === PROCESSING_STATUS_ID
      ) {
        console.log(
          `Current status(id: ${status.id}): ${status.description}. Retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        return fetchSubmissionResult();
      } else {
        return {
          ...result,
          stdout: base64ToString(stdout),
          stderr: base64ToString(stderr).replace(/\n/g, "<br>"),
          compile_output: base64ToString(compile_output),
          message: base64ToString(message),
        };
      }
    };

    return await fetchSubmissionResult();
  } catch (error) {
    console.error("Failed to fetch submission data:", error);
    throw error;
  }
};
