export const EXPERIMENTAL = "experimental";
export const CONTROL = "control";

// Help Types
export const NEXT_STEP = "nextStep";
export const DEBUG_ERROR = "debugError";
export const PREV_HINT_NOT_HELP = "perviousHintNotHelp";

export const NEXT_STEP_PROMPT = `
請告訴我下一步怎麼做，但請不要透漏正確且完整解法讓我複製，
給我的範例程式碼不能是題目的答案，這可以幫助我思考其中的概念。
不需要給我應用到我的問題或範例的程式碼。
請使用繁體中文回覆
`;
export const DEBUG_ERROR_PROMPT = `只能告訴我程式碼哪裡出錯，請不要透漏正確且完整解法讓我複製，其餘與錯誤無關的資訊也請不要透漏。
  請給我的針對該錯誤的範例程式碼但不能是題目的答案，這可以幫助我思考其中的概念。
  不需要給我應用到我的問題或範例的程式碼。
  請使用繁體中文回覆`;

export const PREV_HINT_NOT_HELP_PROMPT = `
上一個提示對我沒有幫助，請給我新的提示，但不要透漏正確且完整解法讓我複製。
請使用繁體中文回覆
`;

export const HELP_TYPE_OPTIONS = [
  {
    type: NEXT_STEP,
    prompt: NEXT_STEP_PROMPT,
    text: "我不知道下一步要怎麼做",
  },
  {
    type: DEBUG_ERROR,
    prompt: DEBUG_ERROR_PROMPT,
    text: "輸出報錯了，哪裡有問題?",
  },
  {
    type: PREV_HINT_NOT_HELP,
    prompt: PREV_HINT_NOT_HELP_PROMPT,
    text: "上一個提示沒有幫助",
  },
];

//----------------------------------------------------------------

export const ACCEPTED_STATUS_ID = 3;
export const EASY = "Easy";
export const MEDIUM = "Medium";
export const HARD = "Hard";
// ----------------------------------------------------------------
