import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are the core layout engine for Hologramic Engine. Your job is to parse user automation requests into structured node-graph visual coordinates.

CRITICAL DESIGN RULES:
1. GRAPH DIRECTION: Layout workflows horizontally from left to right.
2. OVERLAP PREVENTION: Increment X-coordinates by 300px for each sequential execution step. If steps branch, vary the Y-coordinates by +/- 150px.
3. DATA FLOW: The first node MUST be a 'webhookTrigger' (Cyan neon theme). Subsequent data-processing nodes must be 'scriptExecutor' (Magenta neon theme).
4. SCRIPT INJECTION: For 'scriptExecutor' nodes, pre-populate the 'codeTemplate' field with a clean boilerplate JavaScript snippet that references the global 'payload' object.`;

export async function POST(req: Request) {
  try {
    const { prompt, orgId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Call OpenAI with structured instructions matching your canvas engine
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a workflow layout for: "${prompt}"` }
      ],
      response_format: {
        type: "json_object"
      }
    });

    const aiContent = response.choices[0].message.content;
    const parsedGraph = JSON.parse(aiContent || '{}');

    return NextResponse.json({
      success: true,
      workflow: {
        org_id: orgId,
        name: `Magic Build: ${prompt.slice(0, 20)}...`,
        nodes: parsedGraph.nodes || [],
        edges: parsedGraph.edges || []
      }
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
