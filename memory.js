import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { getInputValue } from "@langchain/core/memory";
dotenv.config();

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  model: 'deepseek-chat'
});

const parser = new StringOutputParser();

// 手动维护 history message
// const prompt = ChatPromptTemplate.fromMessages([
//     ["system", `You are a helpful assistant. Answer all questions to the best of your ability.
//     You are talkative and provides lots of specific details from its context. 
//     If the you does not know the answer to a question, it truthfully says you do not know.`],
//     new MessagesPlaceholder("history_message"),
// ]);

// const chain = prompt.pipe(chatModel).pipe(parser);

// const history = new ChatMessageHistory();
// await history.addMessage(new HumanMessage("hello my name is changhao"));

// const res1 = await chain.invoke({
//   history_message: await history.getMessages(),
// })

// await history.addMessage(res1);
// await history.addMessage(new HumanMessage("what's my name?"));
// const res2 = await chain.invoke({
//   history_message: await history.getMessages(),
// })
// console.log(res2)
 
//自动维护history message
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system", `You are a helpful assistant. Answer all questions to the best of your ability.
    You are talkative and provides lots of specific details from its context. 
    If the you does not know the answer to a question, it truthfully says you do not know.`],
    new MessagesPlaceholder("history_message"),
  ["human",{input}]
]);

const chain = prompt.pipe(chatModel).pipe(parser);

const chatWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory:(_sessionId) => history,
  inputMessagesKey: "input",
  historyMessagesKey: "history_message",
})

const res = await chatWithHistory.invoke({
  input: "hello my name is changhao",
},{
  configurable:{
    sessionId: "none"
  }
})

const res2 = await chatWithHistory.invoke({
  input: "what's my name?",
},{
  configurable:{
    sessionId: "none"
  }
})