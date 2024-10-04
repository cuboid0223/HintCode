import { AssistantStream } from "openai/lib/AssistantStream";
import { Dispatch, SetStateAction } from "react";

const sendMessageToGPT = async (
  text: string,
  threadId: string,
  setIsGPTTextReady: Dispatch<SetStateAction<boolean>>,
  handleTextCreated,
  handleTextDelta
) => {
  if (!threadId || !text) return;
  setIsGPTTextReady(true);
  const response = await fetch(`/api/assistants/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      content: text,
    }),
  });

  const stream = AssistantStream.fromReadableStream(response.body);
  handleReadableStream(stream, handleTextCreated, handleTextDelta);
  setIsGPTTextReady(false);
};

const handleReadableStream = (
  stream: AssistantStream,
  handleTextCreated,
  handleTextDelta
) => {
  // messages
  stream.on("textCreated", handleTextCreated);
  stream.on("textDelta", handleTextDelta);
};

export default sendMessageToGPT;
