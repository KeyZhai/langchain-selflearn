import { RunnableSequence } from "@langchain/core/runnables";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/output_parsers";
import { RunnablePassthrough } from "@langchain/core/runnables";
import { getBufferString } from "@langchain/core/messages";

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  model: "deepseek-chat",
});

const summaryPrompt = ChatPromptTemplate.fromTemplate(`
Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:
`);

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant. Answer all questions to the best of your ability.

    Here is the chat history summary:
    {history_summary}
    `,
  ],
  ["human", "{input}"],
]);
let summary = "";
const history = new ChatMessageHistory();

const summaryChain = RunnableSequence.from([
  summaryPrompt,
  chatModel,
  new StringOutputParser(),
]);

const chatChain = RunnableSequence.from([
  {
    input: new RunnablePassthrough({
      func: (input) => history.addUserMessage(input),
    }),
  },
  RunnablePassthrough.assign({
    history_summary: () => summary,
  }),
  chatPrompt,
  chatModel,
  new StringOutputParser(),
  new RunnablePassthrough({
    func: async (input) => {
      history.addAIChatMessage(input);
      const messages = await history.getMessages();
      const new_lines = getBufferString(messages);
      const newSummary = await summaryChain.invoke({
        summary,
        new_lines,
      });
      history.clear();
      messages = newMessages;
    },
  }),
]);
