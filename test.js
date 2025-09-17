import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessage } from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

console.log('开始测试 LangChain Node.js 项目...');

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

// 测试单个消息调用
async function testSingleMessage() {
  console.log('\n=== 测试单个消息调用 ===');
  try {
    const response = await simpleChain.invoke([
      new HumanMessage('请说一个简短的笑话')
    ]);
    console.log('响应:', response);
    return true;
  } catch (error) {
    console.error('单个消息测试失败:', error.message);
    return false;
  }
}

// 测试提示模板
async function testPromptTemplate() {
  console.log('\n=== 测试提示模板 ===');
  try {
    const greetingPrompt = new PromptTemplate({
      template: '你好,{name}！欢迎使用 {product}',
      inputVariables: ['name', 'product']
    });
    
    const formatted = await greetingPrompt.format({ 
      name: 'autumn', 
      product: 'LangChain Node.js' 
    });
    console.log('格式化结果:', formatted);
    return true;
  } catch (error) {
    console.error('提示模板测试失败:', error.message);
    return false;
  }
}

// 运行所有测试
async function runTests() {
  const results = [];
  
  results.push(await testPromptTemplate());
  results.push(await testSingleMessage());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n=== 测试结果 ===`);
  console.log(`通过: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ 所有测试通过！迁移成功！');
  } else {
    console.log('❌ 部分测试失败，请检查配置');
  }
}

runTests().catch(console.error);