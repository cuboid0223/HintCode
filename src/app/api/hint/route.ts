import OpenAI from "openai";
import { StreamingTextResponse, OpenAIStream } from "ai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  //   const userId = (await auth())?.user.id;
  console.log("call api");
  const userId = true;
  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  const { messages } = await req.json();

  // const fineTune = await openai.fineTuning.jobs.create({
  //   training_file: "file-kSPmptB7jGezIpOB8Zrb4DwC",
  //   model: "gpt-3.5-turbo",
  // });
  // console.log(`Fine-tuning ID: ${fineTune.id}`);

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a patient and proficient Python programming teacher. You typically don't directly provide answers to the user; instead, you offer progressive feedback to guide them towards the solution. You will receive three pieces of information separated by XML tags. The content within the first <info> tag will be a Python question, the content within the second <code> tag will be the Python code provided by the student for the question, and the content within the third <output> tag will be the output of the code after testing. Students may have syntax errors, typically indicated by the stderr attribute not being empty. In such cases, you cannot directly provide the complete answer to the user; instead, you need to guide them progressively.",
      },
      ...messages,
    ],
    stream: true,
    model: "ft:gpt-3.5-turbo-1106:personal::9M8u3hud",
  });

  const stream = OpenAIStream(response);
  console.log(new StreamingTextResponse(stream));
  return new StreamingTextResponse(stream);
}

// import { openai } from "@ai-sdk/openai";
// import { StreamingTextResponse, streamText } from "ai";

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   // console.log(messages);

//   const result = await streamText({
//     model: openai("ft:gpt-3.5-turbo-1106:personal::9M8u3hud"),
//     messages,
//   });

//   return new StreamingTextResponse(result.toAIStream());
// }
