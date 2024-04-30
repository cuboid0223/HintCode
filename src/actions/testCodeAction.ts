"use server";
// https://ce.judge0.com/#statuses-and-languages-language
// js -> id: 63
// Python (3.8.1) -> "id": 71
export const testUserCode = async (userCode: string) => {
  //  Buffer.from("fuck").toString("base64"); <- 解決字串 "fuck " 與 "fuck" 不一樣(多一格空格)
  const expectedOutput = Buffer.from("fuck").toString("base64");
  const url =
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&fields=*";
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    body: JSON.stringify({
      language_id: 71,
      source_code: btoa(userCode),
      stdin: "",
      memory_limit: "10000",
      expected_output: expectedOutput,
    }),
  };

  try {
    const response = await fetch(url, options);
    const { token } = await response.json();

    // console.log("token:", token);
    return token;
  } catch (error) {
    console.error(error);
  }
};
