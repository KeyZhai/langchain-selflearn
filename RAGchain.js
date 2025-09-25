import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory,
} from "@langchain/core/runnables";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { ChatMessageHistory } from "@langchain/core/message_histories";
import dotenv from "dotenv";
dotenv.config();

//对话改写 llm
const rephraseChainPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "给定以下对话和一个后续问题，请将后续问题重述为一个独立的问题。请注意，重述的问题应该包含足够的信息，使得没有看过对话历史的人也能理解。",
  ],
  new MessagesPlaceholder("history"),
  ["human", "将以下问题重述为一个独立的问题：\n{question}"],
]);
const rephraseChain = RunnableSequence.from([
  rephraseChainPrompt,
  new ChatOpenAI({
    configuration: {
      baseURL: "https://api.deepseek.com/v1",
      apiKey: process.env.DEEPSEEK_API_KEY,
    },
    model: "deepseek-chat",
    temperature: 0.3,
  }),
  new StringOutputParser(),
]);

const loader = new TextLoader("./data/qiu.txt");
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const splitDocs = await splitter.splitDocuments(docs);

const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.TONGYI_API_KEY,
  model: "qwen3-max",
});

const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
await vectorStore.save("./db/qiu");

async function loadVectorStore() {
  const vectorStore = await FaissStore.load("./db/qiu", embeddings);
  return vectorStore;
}

const vs = await loadVectorStore();
const retriever = vs.asRetriever(2);

const convertPageContentToText = (documents) => {
  return documents.map((doc) => doc.pageContent).join("\n");
};

const contextRetriverChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  convertPageContentToText,
]);

const SYSTEM_TEMPLATE = `
    你是一个熟读刘慈欣的《球状闪电》的终极原着党，精通根据作品原文详细解释和回答问题，你在回答时会引用作品原文。
    并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

    以下是原文中跟用户回答相关的内容：
    {context}
  `;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],
  new MessagesPlaceholder("history"),
  ["human", "现在，你需要基于原文，回答以下问题：\n{question}"],
]);

const model = new ChatOpenAI({
  configuration: {
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
  },
  model: "deepseek-chat",
});

const ragChain = RunnableSequence.from([
  RunnablePassthrough.assign({
    question: rephraseChain,
  }),
  RunnablePassthrough.assign({
    context: contextRetriverChain,
  }),
  prompt,
  model,
  new StringOutputParser(),
]);

// 创建内存中的消息历史存储
const messageHistoryMap = new Map();

const ragChainWithHistory = new RunnableWithMessageHistory({
  runnable: ragChain,
  getMessageHistory: (sessionId) => {
    if (!messageHistoryMap.has(sessionId)) {
      messageHistoryMap.set(sessionId, new ChatMessageHistory());
    }
    return messageHistoryMap.get(sessionId);
  },
  historyMessagesKey: "history",
  inputMessagesKey: "question",
});

const res = await ragChainWithHistory.invoke(
  {
    question: "什么是球状闪电？",
  },
  {
    configurable: { sessionId: "test-history" },
  }
);
console.log(res);
