import { SubmissionsState } from "@/atoms/submissionsDataAtom";
import { Submission } from "@/types/testCase";
import { z } from "zod";

const FormSchema = z
  .object({
    helpType: z
      .string({
        required_error: "您需要何種幫助",
      })
      .optional(),
    text: z
      .string({
        required_error: "請輸入問題",
      })
      .trim()
      .optional(),
    code: z.string().optional(),
    prompt: z.string().optional(),
    submissions: z.custom<SubmissionsState>(),
  })
  .refine(
    (data) => {
      return (data.helpType && !data.text) || (!data.helpType && data.text);
    },
    {
      message: "必須提供 helpType 或 text 其中之一",
      path: ["helpType", "text"],
    }
  );

const createPromptTemplate = (
  data: z.infer<typeof FormSchema>,
  problemStatement: string,
  submissions = null
) => {
  console.log(`
    題目如下:
=========problem statement start========
    ${problemStatement}
=========problem statement end==========
    此題不需要自行呼叫函數，系統會自動呼叫並代入參數
    以下是我目前的程式碼:
==========code start==========

    ${formatCode(data.code)}

===========code end===========

    ${
      submissions
        ? `以下是我的程式經過測試後的輸出
==========test start==========
    ${formatSubmissions(submissions)}
==========test end==========
    `
        : ""
    }
  我的問題是 
    ${data.text}
    ${data.prompt}
  `);
  return `
    題目如下:
=========problem statement start========
    ${problemStatement}
=========problem statement end==========
    此題不需要自行呼叫函數，系統會自動呼叫並代入參數
    以下是我目前的程式碼:
==========code start==========

    ${formatCode(data.code)}

===========code end===========

    ${
      submissions
        ? `以下是我的程式經過測試後的輸出
==========test start==========
    ${formatSubmissions(submissions)}
==========test end==========
    `
        : ""
    }
    ${data.prompt}
  `;
};

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

export default createPromptTemplate;
