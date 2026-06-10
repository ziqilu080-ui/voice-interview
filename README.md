# 🎙️ 语音面试官 — Voice Interview Practice

> 基于浏览器语音识别 + Microsoft Edge 神经网络 TTS + LLM 的智能语音模拟面试系统。

支持 DeepSeek / Anthropic Claude 双 API，专为产品经理、增长、运营等岗位的面试练习设计。

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 🎤 **语音输入** | Web Speech Recognition API，实时语音转文字 |
| 🔊 **神经网络语音** | Microsoft Edge TTS，自然逼真，非机器人声 |
| 🧠 **智能面试官** | DeepSeek / Claude 驱动，多轮次差异化策略 |
| 📋 **5 种面试轮次** | 初面 / 二面 / 终面 / 群面 / Case 面试 |
| 🔍 **深度追问** | 自动识别模糊回答并追问细节、数据口径、决策过程 |
| 📊 **面试评估** | 7 维度能力评分 + 改进建议 |
| 💾 **对话导出** | 一键下载面试记录 |

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18（运行本地服务器）
- **Python** >= 3.10（Edge TTS 语音合成）
- **Chrome 浏览器**（语音识别需要）

### 1. 安装依赖

```bash
# Node 依赖
npm install

# Python Edge TTS（神经网络语音）
pip install edge-tts
```

### 2. 启动服务器

```bash
npm start
# 或
python3 server.py
```

### 3. 打开浏览器

```
http://localhost:3000
```

### 4. 配置面试

1. 选择 API 服务商（DeepSeek / Anthropic）
2. 填入 API Key
3. 填写目标公司、岗位、个人背景
4. 选择面试轮次和题数
5. 选择面试官声音和语速
6. 保存 → 开始面试

## 🎭 面试轮次策略

| 轮次 | 侧重 | 特色 |
|------|------|------|
| **初面** | 产品决策、数据分析、项目深度 | 项目深挖 + 情境题 + 数据方法论 |
| **二面** | 复杂问题拆解、商业 sense、跨团队 | 深度追问 tradeoff + 公司产品题 |
| **终面** | 战略思维、行业判断、AI 视野 | 行业预判 + 商业化 + AI 战略 |
| **群面** | 团队协作、冲突处理、影响力 | 跨团队推动 + 分歧处理 |
| **Case** | 结构化思维、商业分析、估算 | 市场规模 + 产品策略 + 商业决策 |

## 🎤 面试官声音

使用 Microsoft Edge 神经网络语音，提供 5 种中文声音：

| 声音 | 风格 |
|------|------|
| **Yunyang** 👨‍💼 | 男声 · 专业可靠（默认推荐） |
| **Yunxi** 👨‍💼 | 男声 · 阳光活力 |
| **Yunjian** 👨‍💼 | 男声 · 激情有力 |
| **Xiaoxiao** 👩‍💼 | 女声 · 温暖知性 |
| **Xiaoyi** 👩‍💼 | 女声 · 活泼亲切 |

语速可调范围 -50% ~ +100%，默认 +30%（职场节奏）。

## 🧠 面试方法论

本项目的面试策略移植自 [Claude Code mock-interview-pm skill](https://github.com/anthropics/claude-code)，包括：

- **追问技巧表**：7 种场景自动触发追问（模糊回答、数据未展开、回避失败等）
- **公司产品题**：强制覆盖使用体验、改进建议、竞品对比
- **AI 能力考察**：AI 工具使用 + AI 产品切入点
- **7 维度评估**：产品思维、数据分析、沟通表达、商业 sense、用户洞察、AI 应用、战略视野

## 📁 项目结构

```
voice-interview/
├── index.html        # 主应用（前端 UI + 语音识别 + API 调用）
├── server.js         # Node.js 本地服务器（API 代理 + TTS 端点）
├── server.py         # Python 备选服务器
├── package.json      # Node 依赖
└── package-lock.json
```

## 🔑 API Key 获取

- **DeepSeek**：https://platform.deepseek.com/api_keys
- **Anthropic**：https://console.anthropic.com

## ⚠️ 注意事项

- 语音识别需要 Chrome 浏览器，其他浏览器可用文字输入
- Edge TTS 需要 Python `edge-tts` 包正常工作
- API Key 存储在浏览器 localStorage，不会上传到服务器以外的任何地方
- 本项目仅供个人面试练习使用

## 📄 License

MIT
