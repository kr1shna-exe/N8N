import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/dist/tools";
import z from "zod";

const fakeBrowserTool = tool(
  () => {
    return "The search result is xyz...";
  },
  {
    name: "browser_tool",
    description:
      "Useful for when you need to find something on the web or summarize a webpage.",
    schema: z.object({
      url: z.string().describe("The URL of the webpage to search."),
      query: z.string().optional().describe("An optional search query to use."),
    }),
  },
);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
}).bindTools([fakeBrowserTool]);

const toolResult = await llm.invoke([
  [
    "human",
    "Search the web and tell me what the weather will be like tonight in new york. use a popular weather website",
  ],
]);
console.log(toolResult);
