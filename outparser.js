import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const parser = StructuredOutputParser.fromNamesAndDescriptions({
  answer: '回答用户问题的答案',
  evidence: '回答用户问题的证据',
  confidence:'回答用户问题的置信度，0-100之间的整数'
});

const prompt = PromptTemplate.fromTemplate("尽可能的回答用的问题 \n{instructions} \n{question}")

const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  model: 'deepseek-chat'
});

const chain = prompt.pipe(chatModel).pipe(parser);

const res = await chain.invoke({
  question: '蒙娜丽莎是哪位画家的作品？',
  instructions: parser.getFormatInstructions()
});

console.log(res)