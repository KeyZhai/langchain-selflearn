import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

const chatModel = new ChatOpenAI({
  apiKey: process.env.TONGYI_API_KEY,
  model: "qwen-plus",
});
const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a helpful assistant. Answer all questions to the best of your ability.
    You are talkative and provides lots of specific details from its context. 
    If the you does not know the answer to a question, it truthfully says you do not know.`],
    new MessagesPlaceholder("history_message"),
]);
const history = new ChatMessageHistory();

await history.addUserMessage("你好");
await history.addAIMessage("你好！很高兴见到你。");

const res = await history.getMessages();
console.log(res);
