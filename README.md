# LangChain Node.js Project

这是一个从 Deno 迁移到 Node.js 的 LangChain 项目，保持了原有的所有功能。

## 项目特性

- ✅ 支持 ChatOpenAI 模型调用
- ✅ 支持单个消息、批量消息和流式响应
- ✅ 支持提示模板功能
- ✅ 使用最新版本的 LangChain 依赖
- ✅ 支持 TypeScript 和 JavaScript
- ✅ 环境变量配置

## 安装依赖

```bash
npm install
```

## 环境配置

确保 `.env` 文件中包含你的 DeepSeek API 密钥：

```env
DEEPSEEK_API_KEY=your_api_key_here
```

## 运行项目

### JavaScript 版本
```bash
npm start
# 或者
node index.js
```

### TypeScript 版本
```bash
# 先编译 TypeScript
npx tsc
# 然后运行编译后的 JavaScript
node dist/index.js

# 或者直接运行 TypeScript（需要安装 ts-node）
npx ts-node index.ts
```

### 开发模式（自动重启）
```bash
npm run dev
```

## 功能示例

项目包含以下功能示例：

1. **单个笑话生成** - 调用 AI 生成一个笑话
2. **批量消息处理** - 同时处理多个消息请求
3. **流式响应** - 实时流式输出 AI 响应
4. **提示模板** - 使用模板格式化提示

## 项目结构

```
├── .env                 # 环境变量配置
├── package.json         # Node.js 项目配置
├── tsconfig.json        # TypeScript 配置
├── index.js             # JavaScript 入口文件
├── index.ts             # TypeScript 入口文件
├── README.md            # 项目说明
└── 1.ipynb             # 原始 Jupyter notebook（已迁移）
```

## 迁移说明

从 Deno 迁移到 Node.js 的主要变化：

1. **依赖管理**：从 `deno.json` 迁移到 `package.json`
2. **环境变量**：从 `Deno.env.get()` 改为 `process.env` + `dotenv`
3. **模块系统**：使用 ES 模块 (`type: "module"`)
4. **代码组织**：将 Jupyter notebook 中的重复代码合并为单一入口文件
5. **类型支持**：添加 TypeScript 配置和类型定义

## 依赖版本

- `@langchain/openai`: ^0.3.15
- `@langchain/core`: ^0.3.70
- `langchain`: ^0.3.7
- `dotenv`: ^16.4.7
- `lodash`: ^4.17.21

所有依赖都已更新到最新稳定版本。