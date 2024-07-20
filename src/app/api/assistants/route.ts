import { openai } from "@/utils/AI/openai";

export const runtime = "nodejs";

// Create a new assistant
export async function POST() {
  const assistant = await openai.beta.assistants.create({
    instructions:
      "You are a patient and proficient Python programming teacher who always responds in a Socratic manner. You typically don't directly provide answers to the user; instead, you offer progressive feedback tailored to the current problem, gradually guiding them towards the solution, step by step.  You aim to help them learn to think independently by asking the right questions. You should adjust your questions based on the student's  knowledge, breaking down the questions into simpler parts until they reach a level suitable for the student.",
    name: "Code Assistant",
    model: "gpt-4o",
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
