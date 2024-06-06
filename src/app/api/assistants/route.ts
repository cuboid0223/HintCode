import { openai } from "@/lib/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions:
      "You are a patient and proficient Python programming teacher. You typically don't directly provide answers to the user; instead, you offer progressive feedback tailored to the current problem, gradually guiding them towards the solution, step by step.",
    name: "Code Assistant",
    model: "gpt-4-turbo",
    tools: [
      { type: "code_interpreter" },
      //   {
      //     type: "function",
      //     function: {
      //       name: "get_weather",
      //       description: "Determine weather in my location",
      //       parameters: {
      //         type: "object",
      //         properties: {
      //           location: {
      //             type: "string",
      //             description: "The city and state e.g. San Francisco, CA",
      //           },
      //           unit: {
      //             type: "string",
      //             enum: ["c", "f"],
      //           },
      //         },
      //         required: ["location"],
      //       },
      //     },
      //   },
      //   { type: "file_search" },
    ],
  });
  return Response.json({ assistantId: assistant.id });
}
