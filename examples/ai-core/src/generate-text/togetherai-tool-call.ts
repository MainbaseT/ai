import { togetherai } from '@ai-sdk/togetherai';
import { generateText, tool } from 'ai';
import 'dotenv/config';
import { z } from 'zod/v4';
import { weatherTool } from '../tools/weather-tool';

async function main() {
  const result = await generateText({
    model: togetherai('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
    maxOutputTokens: 512,
    tools: {
      weather: weatherTool,
      cityAttractions: tool({
        inputSchema: z.object({ city: z.string() }),
      }),
    },
    prompt:
      'What is the weather in San Francisco and what attractions should I visit?',
  });

  // typed tool calls:
  for (const toolCall of result.toolCalls) {
    if (toolCall.dynamic) {
      continue;
    }

    switch (toolCall.toolName) {
      case 'cityAttractions': {
        toolCall.input.city; // string
        break;
      }

      case 'weather': {
        toolCall.input.location; // string
        break;
      }
    }
  }

  // typed tool results for tools with execute method:
  for (const toolResult of result.toolResults) {
    if (toolResult.dynamic) {
      continue;
    }

    switch (toolResult.toolName) {
      // NOT AVAILABLE (NO EXECUTE METHOD)
      // case 'cityAttractions': {
      //   toolResult.input.city; // string
      //   toolResult.result;
      //   break;
      // }

      case 'weather': {
        toolResult.input.location; // string
        toolResult.output.location; // string
        toolResult.output.temperature; // number
        break;
      }
    }
  }

  console.log('Text:', result.text);
  console.log('Tool Calls:', JSON.stringify(result.toolCalls, null, 2));
  console.log('Tool Results:', JSON.stringify(result.toolResults, null, 2));
}

main().catch(console.error);
