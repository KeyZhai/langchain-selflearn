import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

//将.env的配置注入到 process.env 对象中
import dotenv from "dotenv";
dotenv.config();

const loader = new TextLoader("./data/qiu.txt");
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 100,
});
const splitDocs = await splitter.splitDocuments(docs);

const embeddings = new AlibabaTongyiEmbeddings({
  apiKey: process.env.TONGYI_API_KEY,
  model: "qwen-plus",
});

const vectorStore = new MemoryVectorStore(embeddings);
await vectorStore.addDocuments(splitDocs);
const retriever = vectorStore.asRetriever(2);

const convertPageContentToText = (documents) => {
  return documents.map((doc) => doc.pageContent).join("\n");
};

const contextRetriverChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  convertPageContentToText,
]);

const TEMPLATE = `
你是一个熟读刘慈欣的《球状闪电》的终极原著党，精通根据作品原文详细解释和回答问题，你在回答时会引用作品原文。
并且回答时仅根据原文，尽可能回答用户问题，如果原文中没有相关内容，你可以回答“原文中没有相关内容”，

以下是原文中跟用户回答相关的内容：
{context}

现在，你需要基于原文，回答以下问题：
{question}`;


const prompt = ChatPromptTemplate.fromTemplate(TEMPLATE);

const model = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  model: 'deepseek-reasoner'
});

const ragChain = RunnableSequence.from([
    {
        context: contextRetriverChain,
        question: (input) => input.question,
    },
    prompt,
    model,
    new StringOutputParser()
])

const res = await ragChain.invoke({ question: "球状闪电是如何形成的？" });
console.log(res);