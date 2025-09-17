import { PromptTemplate,PipelinePromptTemplate } from "@langchain/core/prompts";

const fullPrompt = PromptTemplate.fromTemplate(`
你是一个智能管家，今天是 {date}，你的主人的信息是{info}, 
根据上下文，完成主人的需求
{task}`);

const datePrompt = PromptTemplate.fromTemplate(`
今天是 {date}
`);

const infoPrompt = PromptTemplate.fromTemplate(`
你的主人的信息是 {info}
`);

const taskPrompt = PromptTemplate.fromTemplate(`
你的主人的需求是 {task}
`);

const pipelinePrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    { name: 'date', prompt: datePrompt },
    { name: 'info', prompt: infoPrompt },
    { name: 'task', prompt: taskPrompt }
  ],  
  finalPrompt: fullPrompt
});

const formatPrompt = await pipelinePrompt.format({
  date: '2023-08-25',
  info: '你的主人是一个人',
  task: '请给主人写一封邮件'
});


console.log(formatPrompt);
