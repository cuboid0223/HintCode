import { z } from "zod";
import { SubmissionsState } from "@/atoms/submissionsDataAtom";

export const FormSchema = z.object({
  helpType: z
    .number({
      required_error: "您需要何種幫助",
    })
    .optional()
    .nullable(),
  customText: z
    .string({
      required_error: "請輸入問題",
    })
    .trim()
    .optional(),
  code: z.string().optional(),
  prompt: z.string().optional(),
  submissions: z.custom<SubmissionsState>(),
});
// .refine(
//   (data) => {
//     return (
//       (data.helpType && !data.customText) ||
//       (!data.helpType && data.customText)
//     );
//   },
//   {
//     message: "必須提供 helpType 或 text 其中之一",
//     path: ["helpType", "text"],
//   }
// );
