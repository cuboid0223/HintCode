import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request: Request, { params: { threadId } }) {
  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });

  return new Response(stream.toReadableStream());
}

export async function GET(request: Request, { params: { threadId } }) {
  try {
    // console.log("Fetching messages for thread:", threadId);
    // thread_uUpAk93haL1KArBqT9hF3lh6
    const messages = await openai.beta.threads.messages.list(threadId);
    // console.log(messages.data[1].role);
    // console.log(messages.data[0].content[0].text.value);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);

    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch messages" }),
      { status: 500 }
    );
  }
}
