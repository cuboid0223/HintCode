import { HELP_TYPE_OPTIONS } from "@/utils/const";

export const getTextByType = (type: string) => {
  const option = HELP_TYPE_OPTIONS.find((option) => option.type === type);
  return option ? option.text : "";
};

export const getPromptByType = (type: string) => {
  const option = HELP_TYPE_OPTIONS.find((option) => option.type === type);
  return option ? option.prompt : "";
};
