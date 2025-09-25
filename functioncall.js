import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.TONGYI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

function getCurrentWeather({ location, unit = "fahrenheit" }) {
  const weather_info = {
    location: location,
    temperature: "72",
    unit: unit,
    forecast: ["sunny", "windy"],
  };
  return JSON.stringify(weather_info);
}

const tools = [
  {
    type: "function",
    function: {
      name: "getCurrentWeather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
  },
];

const messages = [
  {
    role: "user",
    content: "北京的天气怎么样",
  },
];

const result = await openai.chat.completions.create({
  model: "qwen-flash",
  messages,
  tools,
  tool_choice: "none",
});
console.log(result.choices[0]);
