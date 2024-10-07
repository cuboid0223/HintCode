import { Submission } from "@/types/testCase";
import { z } from "zod";
import { FormSchema } from "./FormSchemas";
/*
這個 function 是將 題目資訊、程式測資輸出與 隱藏的 prompt 格式化成自然語言
合併成一大串字串給 GPT
*/

const createPromptTemplate = (
  data: z.infer<typeof FormSchema>,
  problemStatement: string,
  starterFunctionName: string,
  submissions: Submission[] | null = null
) => {
  return `
    題目如下:
=========problem statement start========
    ${problemStatement}
=========problem statement end==========

    此題不需要自行呼叫函數，系統會自動呼叫 ${starterFunctionName} 並代入參數
    以下是我目前的程式碼:
==========code start==========

${formatCode(data.code)}

===========code end===========

    ${submissions ? formatSubmissionsSection(submissions) : ""}
    ${data?.customText ? formatCustomTextSection(data.customText) : ""}
    ${data.prompt}
  `;
};

// 新增一個函數來格式化 submissions 部分
const formatSubmissionsSection = (submissions: Submission[]) => `
以下是我的程式經過測試後的輸出
==========submissions start==========
    ${formatSubmissions(submissions)}
==========submissions end==========`;

const formatCode = (code: string) => {
  return code
    .replace(/^\s*'''\s*/, "") // 移除開始的'''以及前面的空格
    .replace(/\s*'''$/, "") // 移除結尾的'''以及後面的空格
    .trim(); // 移除前後的空格
};

const formatSubmissions = (data: Submission[]) => {
  /*
    將測試資料的結果轉成純文字(自然語言)，方便 GPT 讀取
    */
  const formattedData = data.map((ele, id) => {
    const output = ele.stdout ? ele.stdout : "空";
    const error = ele.stderr ? ele.stderr : "空";
    const msg = ele.message ? ele.message : "空";
    const status = ele.status.description;
    return `
      測資${
        id + 1
      } : 其輸出為 ${output}，錯誤為 ${error}，訊息為 ${msg}，判斷為 ${status}
      `;
  });
  return formattedData;
};

const formatCustomTextSection = (text: string) => {
  return `我想知道的是，${text}`;
};

export default createPromptTemplate;
