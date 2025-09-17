import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 初始化ChatOpenAI模型
const chatModel = new ChatOpenAI({
  configuration: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
  },
  model: 'deepseek-chat'
});

const outputParser = new StringOutputParser();
const simpleChain = chatModel.pipe(outputParser);

// 示例1: 单个消息调用
async function singleJoke() {
  console.log('=== 单个笑话示例 ===');
  const response = await simpleChain.invoke([
    new HumanMessage('tell me a joke')
  ]);
  console.log(response);
  return response;
}

// 示例2: 批量消息处理
async function batchMessages() {
  console.log('\n=== 批量消息示例 ===');
  const responses = await simpleChain.batch([
    [new HumanMessage('tell me a joke')],
    [new HumanMessage('who are you')]
  ]);
  console.log(responses);
  return responses;
}

// 示例3: 流式响应
async function streamResponse() {
  console.log('\n=== 流式响应示例 ===');
  const response = await simpleChain.stream([
    new HumanMessage('tell me a joke')
  ]);
  
  for await (const chunk of response) {
    process.stdout.write(chunk);
  }
  console.log('\n');
}

// 示例4: 提示模板
async function promptTemplateExample() {
  console.log('\n=== 提示模板示例 ===');
  const greetingPrompt = new PromptTemplate({
    template: '你好,{name}',
    inputVariables: ['name']
  });
  
  const formatGreetingPrompt = await greetingPrompt.format({ name: 'autumn' });
  console.log(formatGreetingPrompt);
  return formatGreetingPrompt;
}

// 主函数
async function main() {
  try {
    await singleJoke();
    await batchMessages();
    await streamResponse();
    await promptTemplateExample();
  } catch (error) {
    console.error('Error:', error);
  }
}

// 运行主函数
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  main();
}

export {
  chatModel,
  outputParser,
  simpleChain,
  singleJoke,
  batchMessages,
  streamResponse,
  promptTemplateExample
};