import http from "k6/http";
import { sleep, check } from "k6";

const IN_QUEUE_STATUS_ID = 1;
const PROCESSING_STATUS_ID = 2;
const JUDGE0_PYTHON_ID = 71;
const POST_URL = `${__ENV.AWS_JUDGE0_URL}/submissions/?base64_encoded=true&wait=false`;

export const options = {
  // 根據之前實驗，30 人 兩小時會有約 14000 次 req
  scenarios: {
    test_scenario: {
      executor: "constant-arrival-rate",
      rate: 2, //1 人每秒是 0.065 次 req （10 人模擬 30 人，0.065*30 = 2 req）， 30 人一起使用時，每秒鐘幾乎發出 2 次請求。
      timeUnit: "1s", // 每秒 2 次請求
      duration: "2h", // 測試持續兩小時
      preAllocatedVUs: 10, // 預分配的虛擬使用者數量
      maxVUs: 20, // 最大虛擬使用者數量（允許更多的併發）
    },
  },
};

export default function testScenario() {
  // 1. 定義 POST 請求的 URL 和資料

  const postPayload = JSON.stringify({
    language_id: JUDGE0_PYTHON_ID,

    // def greet():\n  # Write your code here\n  print(\"Hello World\")\n\n\ngreet()
    // base64 encoded:
    source_code:
      "ZGVmIGdyZWV0KCk6CiAgIyBXcml0ZSB5b3VyIGNvZGUgaGVyZQogIHByaW50KCJIZWxsbyBXb3JsZCIpICAKCgpncmVldCgp",
    stdin: "",
    memory_limit: "10000",

    expected_output: `SGVsbG8gV29ybGQ=`, // Hello World base64 encoded:
  });
  const postHeaders = {
    "Content-Type": "application/json",
  };

  // 2. 發送 POST 請求
  const postResponse = http.post(POST_URL, postPayload, {
    headers: postHeaders,
  });

  // 檢查 POST 回應是否成功
  check(postResponse, {
    "POST status is 201": (r) => r.status === 201,
    "POST returned token": (r) => r.json().token !== undefined,
  });

  const token = postResponse.json().token;
  console.log(`Create new Token: ${token}`);

  // 持續發送 GET 請求直到狀態變更
  const getUrl = `${__ENV.AWS_JUDGE0_URL}/submissions/${token}/?base64_encoded=true`;

  let statusId;
  do {
    const getResponse = http.get(getUrl);

    // 檢查 GET 回應是否成功
    check(getResponse, {
      "GET status is 200": (r) => r.status === 200,
      "GET contains status": (r) => r.json().status !== undefined,
    });

    statusId = getResponse.json().status.id;
    console.log(`Current Status ID: ${statusId}`);

    // 如果狀態仍為 IN_QUEUE 或 PROCESSING，等待 300 毫秒
    if (statusId === IN_QUEUE_STATUS_ID || statusId === PROCESSING_STATUS_ID) {
      sleep(0.3); // 等待 300 毫秒
    } else {
      // 印出成功的結果
      console.log(`Final Status: ${getResponse.json().status.description}`);
    }
  } while (
    statusId === IN_QUEUE_STATUS_ID ||
    statusId === PROCESSING_STATUS_ID
  );

  // 5. 模擬每次請求之間的間隔
  sleep(1);
}
