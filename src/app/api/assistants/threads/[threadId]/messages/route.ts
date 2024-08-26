import { assistantId } from "@/utils/AI/assistant-config";
import { openai } from "@/utils/AI/openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Send a new message to a thread
export async function POST(request: Request, { params: { threadId } }) {
  try {
    const { content } = await request.json();
    console.log(content);
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });

    const stream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    return new Response(stream.toReadableStream());
  } catch (error) {
    console.error("Error processing POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request, { params: { threadId } }) {
  try {
    // console.log("Fetching messages for thread:", threadId);
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
