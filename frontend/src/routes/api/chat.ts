import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { DEFAULT_MODEL, isModelId } from "@/lib/mavis/models";
import { PERSONAS, isPersonaId } from "@/lib/mavis/personas";
import { readUrl, searchWeb } from "@/lib/web-search.server";

type ChatRequestBody = {
  messages?: unknown;
  persona?: unknown;
  model?: unknown;
  webSearch?: unknown;
};

const BASE_PROMPT = `You are Mavis, a multimodal assistant.
- Answer in markdown. Use fenced code blocks with a language tag for code.
- When the web_search tool is available and the question touches on current events, prices, releases, versions or anything time-sensitive, search before answering and cite what you used inline.
- Use read_url whenever the user pastes a link or asks about a specific page.
- If the user attaches an image or document, read it before answering.
- Never invent sources or claim you searched when you did not.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        const { messages } = body;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const persona = isPersonaId(body.persona) ? body.persona : "default";
        const modelId = isModelId(body.model) ? body.model : DEFAULT_MODEL;
        const webEnabled = body.webSearch !== false;

        const gateway = createLovableAiGatewayProvider(key);

        const tools = {
          read_url: tool({
            description:
              "Fetch a web page or plain-text document by URL and return its readable text.",
            inputSchema: z.object({ url: z.string().url() }),
            execute: async ({ url }) => readUrl(url),
          }),
          ...(webEnabled
            ? {
                web_search: tool({
                  description:
                    "Search the live web. Returns titles, URLs and snippets to cite.",
                  inputSchema: z.object({
                    query: z.string().min(2).describe("Focused search query"),
                  }),
                  execute: async ({ query }) => searchWeb(query),
                }),
              }
            : {}),
        };

        const result = streamText({
          model: gateway(modelId),
          system: `${BASE_PROMPT}\n\n${PERSONAS[persona].prompt}${
            webEnabled ? "" : "\n\nWeb search is switched off for this message; do not claim to have searched."
          }`,
          messages: await convertToModelMessages(messages as UIMessage[]),
          tools,
          stopWhen: stepCountIs(8),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) =>
            error instanceof Error ? error.message : "Something went wrong",
        });
      },
    },
  },
});
