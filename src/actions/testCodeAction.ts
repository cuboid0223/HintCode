"use server";

import { Languages } from "@/types/global";
import {
  DEFAULT_LANGUAGE_ID,
  IN_QUEUE_STATUS_ID,
  LANGUAGE_IDS,
  PROCESSING_STATUS_ID,
} from "@/utils/const";
import base64ToString from "@/utils/testCases/base64ToString";
import { validateAuthToken } from "@/utils/testCases/judge0Service";
import stringToBase64 from "@/utils/testCases/stringToBase64";

type CodeInfo = {
  userCode: string;
  expectedOutput: string;
  selectedLang: Languages;
};

const JUDGE0_API_BASE = process.env.AWS_JUDGE0_URL;
const SERVER_API_KEY = process.env.MY_JUDGE0_SERVER_API_KEY;
const RETRY_DELAY_MS = 300; // 等待重試的時間
const HEADERS = {
  "content-type": "application/json",
};

export const submitUserCodeForTesting = async (codeInfo: CodeInfo) => {
  const isTokenValid = await validateAuthToken();
  if (!isTokenValid) {
    throw new Error("目前測資服務關閉，請通知我開啟服務 !");
  }

  const { userCode, expectedOutput, selectedLang } = codeInfo;
  const memoryLimit = process.env.JUDGE0_MEMORY_LIMIT || "10000";

  const options = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      language_id: LANGUAGE_IDS[selectedLang] || DEFAULT_LANGUAGE_ID,
      source_code: stringToBase64(userCode),
      stdin: "",
      memory_limit: memoryLimit,
      expected_output: stringToBase64(expectedOutput),
    }),
  };

  try {
    const response = await fetch(
      `${JUDGE0_API_BASE}/submissions?base64_encoded=true&fields=*`,
      options
    );
    const { token } = await response.json();
    return token;
  } catch (error) {
    console.error("Failed to submit user code:", error);
    throw new Error("Failed to submit code to Judge0 API.");
  }
};

export const getSubmissionData = async (token: string) => {
  const url = `${JUDGE0_API_BASE}/submissions/${token}?base64_encoded=true`;

  try {
    const fetchSubmissionResult = async () => {
      const response = await fetch(url, { method: "GET", headers: HEADERS });
      const result = await response.json();
      const { stdout, stderr, message, compile_output, status } = result;

      if (
        status.id === IN_QUEUE_STATUS_ID ||
        status.id === PROCESSING_STATUS_ID
      ) {
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
