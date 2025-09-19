import {TextLoader} from 'langchain/document_loaders/fs/text';
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter';
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import dotenv from 'dotenv';
dotenv.config();

const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.TONGYI_API_KEY,
  model: 'qwen-plus'
});

const loader = new TextLoader('./data/kong.txt');
const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 100,
  chunkOverlap: 20,
});

const splitDocs = await textSplitter.splitDocuments(docs);

const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

const retriever = vectorStore.asRetriever(2);

const res = await retriever.invoke('茴香豆是做什么用的');

console.log(res);