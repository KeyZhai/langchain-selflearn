import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { BufferMemory } from "@langchain/core/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
dotenv.config();

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  model: "deepseek-chat",
});

const parser = new StringOutputParser();
const memory = new BufferMemory();
const TEMPLATE = `
你是一个乐于助人的 ai 助手。尽你所能回答所有问题。

这是跟人类沟通的聊天历史:
{history}

据此回答人类的问题:
{input}
`;

const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);
let tempInput = "";
const chain = RunnableSequence.from([
  {
    input: new RunnablePassthrough(),
    memoryHistory: async (input) => {
      const history = await memory.loadMemoryVariables({ input });
      tempInput = input;
      return history;
    },
  },
  RunnablePassthrough.assign({
    history: (inputs) => inputs.memoryHistory.history,
  }),
  prompt,
  chatModel,
  parser,
  new RunnablePassthrough({
    func: async (output) => {
      await memory.saveContext({ input: tempInput }, { output });
    },
  }),
]);
