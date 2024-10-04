import { Orbitron } from "next/font/google";

export const SUPER_USER = "superuser";
export const USER = "user";

export const EXPERIMENTAL = "experimental";
export const CONTROL = "control";

// Auth Dialog
export const LOGIN = "login";
export const REGISTER = "register";
export const FORGET_PASSWORD = "forgotPassword";

// DIFFICULTY_CLASSES
export const DIFFICULTY_CLASSES = {
  Easy: "text-dark-green-s",
  Medium: "text-dark-yellow",
  Hard: "text-dark-pink",
};
export const EASY = "Easy";
export const MEDIUM = "Medium";
export const HARD = "Hard";

// EDITOR_FONT_SIZES
export const EDITOR_FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
];

// RADIO_VALUE
export const RADIO_VALUE = ["非常不同意", "不同意", "普通", "同意", "非常同意"];

// font text
export const orbitron400 = Orbitron({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const orbitron600 = Orbitron({
  weight: "600",
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const ASSISTANT_INSTRUCTIONS =
  "You are a patient and proficient programming teacher who always responds in a Socratic manner. You *never* give the student the answer; instead, you offer progressive feedback tailored to the current problem, gradually guiding them towards the solution, step by step.  You aim to help them learn to think independently by asking the right questions. You should adjust your questions based on the student's  knowledge, breaking down the questions into simpler parts until they reach a level suitable for the student.";
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
    text: "我不知道(下一步要怎麼做?)",
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
// Judge0 的 咚咚
export const IN_QUEUE_STATUS_ID = 1;
export const PROCESSING_STATUS_ID = 2;
export const ACCEPTED_STATUS_ID = 3;
export const WRONG_ANSWER_STATUS_ID = 4;
export const RUNTIME_ERROR_STATUS_ID = 11;

export const LANGUAGE_PYTHON_ID = 71; // https://ce.judge0.com/#statuses-and-languages-language
export const LANGUAGE_VB_ID = 84;
export const DEFAULT_LANGUAGE_ID = LANGUAGE_PYTHON_ID;
export const LANGUAGE_IDS = {
  py: LANGUAGE_PYTHON_ID, // Python
  vb: LANGUAGE_VB_ID, // Visual Basic
};
// ----------------------------------------------------------------
// 這個變數，是為了監聽學生在解題的過程中，有沒有按照我們的預期行為
// 目的是為了產生 行為轉換圖
// 最終每題會產生一個 number array 透過 sliding window 來計算行為轉換的次數
export const BEHAVIOR_IDS = {
  NEXT_STEP: "1",
  DEBUG_ERROR: "2",
  ASK_CUSTOM_QUESTION: "4",
  READ_QUESTION_AGAIN: "5",
  EXECUTION_SUCCESS: "6",
  EXECUTION_FAILURE: "7",
};

// ----------------------------------------------------------------
