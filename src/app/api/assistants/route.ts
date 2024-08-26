import { openai } from "@/utils/AI/openai";
import { ASSISTANT_INSTRUCTIONS } from "@/utils/const";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions: ASSISTANT_INSTRUCTIONS,
    name: "Code Assistant",
    model: "gpt-4o",
    tools: [{ type: "code_interpreter" }],
  });
  return Response.json({ assistantId: assistant.id });
}
