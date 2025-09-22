import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { ChatOpenAI } from '@langchain/openai';
import { MultiQueryRetriever } from "langchain/retrievers/multi_query";

import dotenv from 'dotenv'
dotenv.config()

const directory = './db/kongyiji';
const embeddings = new AlibabaTongyiEmbeddings({
    apiKey: process.env.TONGYI_API_KEY,
    model: 'qwen-plus'
})
const vectorStore = await FaissStore.load(directory, embeddings);

const model = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  model: 'deepseek-chat'
});

const retriever = MultiQueryRetriever.fromLLM({
  llm: model,
  retriever: vectorStore.asRetriever(3),
  queryCount: 3,      
  verbose: true
})

const res = await retriever.invoke('茴香豆是什么做的？')
console.log(res)