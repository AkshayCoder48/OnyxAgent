<p align="center"><img src="https://github.com/user-attachments/assets/eca9a9ec-8534-4615-9e0f-96c5ac1d10a3" alt="OnyxAgent" width="420" /></p>

<p align="center">
  <a href="https://github.com/zhayujie/OnyxAgent/releases/latest"><img src="https://img.shields.io/github/v/release/zhayujie/OnyxAgent?cacheSeconds=3600" alt="Latest release"></a>
  <a href="https://github.com/zhayujie/OnyxAgent/blob/master/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT"></a>
  <a href="https://github.com/zhayujie/OnyxAgent"><img src="https://img.shields.io/github/stars/zhayujie/OnyxAgent?style=flat-square&cacheSeconds=3600" alt="Stars"></a>
  <a href="https://docs.onyxagent.ai/"><img src="https://img.shields.io/badge/Docs-onyxagent.ai-blue?style=flat&logo=readthedocs&logoColor=white" alt="Docs"></a>
</p>

<p align="center">
  <a href="https://trendshift.io/repositories/25763" target="_blank"><img src="https://trendshift.io/api/badge/repositories/25763" alt="zhayujie%2FOnyxAgent | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>
</p>

<p align="center">
  [English] | [<a href="docs/zh/README.md">中文</a>] | [<a href="docs/ja/README.md">日本語</a>]
</p>

**OnyxAgent** is an open-source super AI assistant that proactively plans tasks, controls your computer and external services, creates and runs Skills, builds a personal knowledge base and long-term memory, and grows alongside you through self-evolution — a reference implementation of Agent Harness engineering.

OnyxAgent is lightweight, easy to deploy, and built to extend. Plug in any major LLM provider and run it 24/7 on a personal computer or server, across the web and all major IM platforms.

<p align="center">
  <a href="https://onyxagent.ai/">🌐 Website</a> &nbsp;·&nbsp;
  <a href="https://docs.onyxagent.ai/intro/index">📖 Docs</a> &nbsp;·&nbsp;
  <a href="https://docs.onyxagent.ai/guide/quick-start">🚀 Quick Start</a> &nbsp;·&nbsp;
  <a href="https://skills.onyxagent.ai/">🧩 Skill Hub</a> &nbsp;·&nbsp;
  <a href="https://link-ai.tech/onyxagent/create">☁️ Try Online</a>
</p>

<br/>

## 🌟 Highlights

| Capability | Description |
| :--- | :--- |
| [Planning](https://docs.onyxagent.ai/intro/architecture) | Decomposes complex tasks and executes them step by step, looping over tools until the goal is reached |
| [Memory](https://docs.onyxagent.ai/memory/index) | Three-tier architecture (context → daily → core), automatic Deep Dream distillation, hybrid keyword + vector retrieval |
| [Knowledge](https://docs.onyxagent.ai/knowledge/index) | Auto-curates structured knowledge into a Markdown wiki, builds an evolving knowledge graph with visual browsing |
| [Evolution](https://docs.onyxagent.ai/memory/self-evolution) | Self-Evolution reviews conversations automatically to improve skills, follow up on unfinished tasks, and consolidate memory and knowledge, growing through everyday use |
| [Skills](https://docs.onyxagent.ai/skills/index) | One-click install from [Skill Hub](https://skills.onyxagent.ai/), GitHub, ClawHub; or create custom skills via natural-language conversation |
| [Tools](https://docs.onyxagent.ai/tools/index) | Built-in file I/O, terminal, browser, scheduler, memory retrieval, web search, and 10+ more tools — with native MCP integration |
| [Channels](https://docs.onyxagent.ai/channels/index) | Integrates with Web, WeChat, Feishu, DingTalk, WeCom, QQ, Official Accounts, Telegram, and Slack |
| Multimodal | First-class support for text, images, voice, and files — recognition, generation, and delivery |
| [Models](https://docs.onyxagent.ai/models/index) | Claude, GPT, Gemini, DeepSeek, Qwen, GLM, Kimi, MiniMax, Doubao, and more — swap providers from the Web console with one click |
| [Deploy](https://docs.onyxagent.ai/guide/quick-start) | One-line installer, unified Web console, multiple deployment modes (local, Docker, server) |

<br/>

## 🏗️ Architecture

<img src="https://cdn.jsdelivr.net/gh/zhayujie/onyxagent-assets@main/architecture/en/architecture.jpg" alt="OnyxAgent Architecture" width="750"/>

OnyxAgent is a complete **Agent Harness**: messages flow in through **Channels**; the **Agent Core** plans and reasons over memory, knowledge, and the available tools and skills; **Models** generate the response, which is sent back through the originating channel. Every layer is decoupled and independently extensible.

Read more in [Architecture](https://docs.onyxagent.ai/intro/architecture).

<br/>

## 🚀 Quick Start

A one-line installer takes care of dependencies, configuration, and startup:

**Linux / macOS:**

```bash
bash <(curl -fsSL https://cdn.link-ai.tech/cod./onyx/run.sh)
```

**Windows (PowerShell):**

```powershell
irm https://cdn.link-ai.tech/cod./onyx/run.ps1 | iex
```

**Docker:**

```bash
curl -O https://cdn.link-ai.tech/cod./onyx/docker-compose.yml
docker compose up -d
```

Once started, open `http://localhost:9899` to access the **Web console** — your one-stop hub to chat with the Agent, configure models, connect channels, and install skills.

> Deploying on a server? Set `web_host` to `0.0.0.0` in `config.json` to make the console reachable from outside, and set `web_password` to protect it. Don't forget to open port `9899` in your firewall or security group.

> 📖 Detailed guides: [Quick Start](https://docs.onyxagent.ai/guide/quick-start) · [Install from Source](https://docs.onyxagent.ai/guide/manual-install) · [Upgrade](https://docs.onyxagent.ai/guide/upgrade)

After installation, manage the service with the [onyx CLI](https://docs.onyxagent.ai/cli/index):

```bash
onyx start | stop | restart        # service control
onyx status | logs                  # status and logs
onyx update                         # pull latest code and restart
onyx skill install <name>           # install a skill
onyx install-browser                # install browser automation
```

<br/>

## 🤖 Models

OnyxAgent supports all mainstream LLM providers. **Chat, vision, image generation, ASR/TTS, and embeddings** can each be routed to a different vendor. Providers are configured directly in the Web console — no manual file editing required.

| Provider | Featured Models | Chat | Vision | Image Gen | ASR | TTS | Embedding |
| --- | --- | :-: | :-: | :-: | :-: | :-: | :-: |
| [Claude](https://docs.onyxagent.ai/models/claude) | claude-fable-5 | ✅ | ✅ | | | | |
| [OpenAI](https://docs.onyxagent.ai/models/openai) | gpt-5.5, o-series | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Gemini](https://docs.onyxagent.ai/models/gemini) | gemini-3.5-flash | ✅ | ✅ | ✅ | | | |
| [DeepSeek](https://docs.onyxagent.ai/models/deepseek) | deepseek-v4-flash / pro | ✅ | | | | | |
| [Qwen](https://docs.onyxagent.ai/models/qwen) | qwen3.7-plus | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [GLM](https://docs.onyxagent.ai/models/glm) | glm-5.1, glm-5v-turbo | ✅ | ✅ | | ✅ | | ✅ |
| [Doubao](https://docs.onyxagent.ai/models/doubao) | doubao-seed-2.0 series | ✅ | ✅ | ✅ | | | ✅ |
| [Kimi](https://docs.onyxagent.ai/models/kimi) | kimi-k2.6 | ✅ | ✅ | | | | |
| [MiniMax](https://docs.onyxagent.ai/models/minimax) | MiniMax-M3 | ✅ | ✅ | ✅ | | ✅ | |
| [ERNIE](https://docs.onyxagent.ai/models/qianfan) | ernie-5.1 | ✅ | ✅ | | | | |
| [MiMo](https://docs.onyxagent.ai/models/mimo) | mimo-v2.5 / pro | ✅ | ✅ | | | ✅ | |
| [LinkAI](https://docs.onyxagent.ai/models/linkai) | One key for 100+ models | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Custom](https://docs.onyxagent.ai/models/custom) | Local models / third-party proxy | ✅ | | | | | |

> For details on each provider, see the [Models overview](https://docs.onyxagent.ai/models/index).

<br/>

## 💬 Channels

A single Agent instance can serve multiple channels in parallel. Most channels can be onboarded right from the Web console.

| Channel | Text | Image | File | Voice | Group |
| --- | :-: | :-: | :-: | :-: | :-: |
| [Web Console](https://docs.onyxagent.ai/channels/web) (default) | ✅ | ✅ | ✅ | ✅ | |
| [Telegram](https://docs.onyxagent.ai/channels/telegram) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [Slack](https://docs.onyxagent.ai/channels/slack) | ✅ | ✅ | ✅ | | ✅ |
| [Discord](https://docs.onyxagent.ai/channels/discord) | ✅ | ✅ | ✅ | | ✅ |
| [WeChat](https://docs.onyxagent.ai/channels/weixin) | ✅ | ✅ | ✅ | ✅ | |
| [Feishu / Lark](https://docs.onyxagent.ai/channels/feishu) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [DingTalk](https://docs.onyxagent.ai/channels/dingtalk) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [WeCom Bot](https://docs.onyxagent.ai/channels/wecom-bot) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [QQ](https://docs.onyxagent.ai/channels/qq) | ✅ | ✅ | ✅ | | ✅ |
| [WeCom App](https://docs.onyxagent.ai/channels/wecom) | ✅ | ✅ | ✅ | ✅ | |
| [WeChat Customer Service](https://docs.onyxagent.ai/channels/wechat-kf) | ✅ | ✅ | ✅ | ✅ | |
| [WeChat Official Account](https://docs.onyxagent.ai/channels/wechatmp) | ✅ | ✅ | | ✅ | |

> See the [Channels overview](https://docs.onyxagent.ai/channels/index) for setup details.

<img src="https://cdn.jsdelivr.net/gh/zhayujie/onyxagent-assets@main/screenshots/en/web-console-chat.png" alt="OnyxAgent Web Console" width="800"/>

*The Web console is the default channel and the unified entry point to configure models, channels, skills, memory, and more.*

<br/>

## 🧠 Memory & Knowledge Base

**Long-term memory** uses a three-tier architecture: conversation context (short-term) → daily memory (mid-term) → MEMORY.md (long-term). A nightly **Deep Dream** pass distills scattered memories into refined long-term entries and a narrative journal. See [Long-term Memory](https://docs.onyxagent.ai/memory/index) · [Deep Dream](https://docs.onyxagent.ai/memory/deep-dream).

**Personal knowledge base** complements the time-ordered memory by organizing structured knowledge **by topic**. The Agent automatically curates valuable information from conversations, maintains cross-references and indexes, and the Web console offers an interactive knowledge-graph view. See [Personal Knowledge Base](https://docs.onyxagent.ai/knowledge/index).

<table>
  <tr>
    <td width="50%">
      <img src="https://cdn.jsdelivr.net/gh/zhayujie/onyxagent-assets@main/screenshots/en/web-console-memory.png" alt="Long-term Memory" />
      <p align="center"><em>Long-term Memory · Three-tier architecture + Deep Dream</em></p>
    </td>
    <td width="50%">
      <img src="https://cdn.jsdelivr.net/gh/zhayujie/onyxagent-assets@main/screenshots/en/web-console-knowledge.png" alt="Personal Knowledge Base" />
      <p align="center"><em>Knowledge Base · Auto-curated Markdown wiki</em></p>
    </td>
  </tr>
</table>

<br/>

## 🔧 Tools & Skills

**Tools** are atomic capabilities the Agent uses to interact with system resources. **Skills** are higher-level workflows defined by a manifest file that compose multiple tools to accomplish complex tasks.

### Tool System

**Built-in tools** cover file I/O (`read` / `write` / `edit` / `ls`), terminal (`bash`), file sending (`send`), memory retrieval (`memory`), environment variables (`env_config`), web fetching (`web_fetch`), scheduling (`scheduler`), web search (`web_search`), vision (`vision`), and browser automation (`browser`).

**MCP protocol** integrates the open ecosystem of [Model Context Protocol](https://modelcontextprotocol.io) servers. A single `mcp.json` is enough — supports stdio / SSE transports, hot reload, and zero-code integration.

Learn more: [Tools overview](https://docs.onyxagent.ai/tools/index) · [MCP integration](https://docs.onyxagent.ai/tools/mcp).

### Skills System

- **[Skill Hub](https://skills.onyxagent.ai/)** — open skill marketplace: browse, search, install in one click
- **GitHub / ClawHub / URL and more** — install skills from any source
- **Conversational authoring** — generate custom skills through dialogue with `skill-creator`; turn any workflow or third-party API into a reusable skill

```bash
/skill list                   # list installed skills
/skill search <keyword>        # search the marketplace
/skill install <name>          # one-click install
```

Learn more: [Skills overview](https://docs.onyxagent.ai/skills/index) · [Creating Skills](https://docs.onyxagent.ai/skills/create).

<br/>

## 🏷 Changelog

> **2026.06.09:** [v2.1.1](https://github.com/zhayujie/OnyxAgent/releases/tag/2.1.1) — Self-Evolution, Web console upgrades (message management, parallel sessions), cross-platform MCP enhancements with concurrent calls, new models (MiniMax-M3, qwen3.7-plus), Python 3.13 support.

> **2026.06.01:** [v2.1.0](https://github.com/zhayujie/OnyxAgent/releases/tag/2.1.0) — Internationalization, new channels (Telegram, Discord, Slack, WeChat Customer Service), CLI interaction upgrades, streamlined one-line install, MCP Streamable HTTP support, new models (claude-opus-4-8, MiMo).

> **2026.05.22:** [v2.0.9](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.9) — Model management, MCP protocol support, persistent browser sessions, new models (gpt-5.5, gemini-3.5-flash, qwen3.7-max), deployment hardening.

> **2026.05.06:** [v2.0.8](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.8) — Feishu channel overhaul (voice, streaming, QR onboarding), DeepSeek V4 and Baidu Qianfan support, scheduler tool upgrades.

> **2026.04.22:** [v2.0.7](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.7) — Built-in image generation (GPT Image 2, Nano Banana), new models (Kimi K2.6, Claude Opus 4.7, GLM 5.1), memory and knowledge enhancements.

> **2026.04.14:** [v2.0.6](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.6) — Knowledge base, Deep Dream memory distillation, smart context compression, multi-session Web console.

> **2026.04.01:** [v2.0.5](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.5) — Onyx CLI, Skill Hub open source, browser tool, WeCom Bot QR onboarding.

> **2026.02.03:** [v2.0.0](https://github.com/zhayujie/OnyxAgent/releases/tag/2.0.0) — Major upgrade to a super Agent assistant with multi-step task planning, long-term memory, and the Skills framework.

Full history: [Release Notes](https://docs.onyxagent.ai/releases/overview)

<br/>

## 🤝 Community & Support

[File an issue](https://github.com/zhayujie/OnyxAgent/issues) on GitHub, or scan the QR code below to join our WeChat community:

<img width="130" src="https://img-1317903499.cos.ap-guangzhou.myqcloud.com/docs/open-community.png">

<br/>

## 🔗 Related Projects

- **[Onyx Skill Hub](https://github.com/zhayujie/onyx-skill-hub)** — open skill marketplace for AI Agents; works with OnyxAgent, OpenClaw, Claude Code, and more
- **[bot-on-anything](https://github.com/zhayujie/bot-on-anything)** — lightweight LLM application framework with integrations for Slack, Telegram, Discord, Gmail, and more
- **[AgentMesh](https://github.com/MinimalFuture/AgentMesh)** — open-source multi-agent framework for solving complex problems through team collaboration

<br/>

## 🏢 Enterprise Services

[**LinkAI**](https://link-ai.tech/) is an all-in-one AI Agent platform for enterprises and developers, offering managed hosting and enterprise-grade support for OnyxAgent:

- **🚀 Zero-deployment hosted runtime** — spin up a [OnyxAgent online assistant](https://link-ai.tech/onyxagent/create) in under a minute, no server required
- **🧠 Agent infrastructure** — unified access to LLMs, knowledge bases, databases, skills, and workflows; plug-and-play building blocks that extend what OnyxAgent can do
- **🏢 Team & enterprise features** — workspaces, role-based access, audit logs, and private deployment for production use cases

For enterprise inquiries: sales@simple-future.tech or [scan the QR code](https://cdn.link-ai.tech/consultant.jpg) to reach our team on WeChat.

<br/>

## 🛠️ Development & Contributing

All kinds of contributions are welcome — new features, bug fixes, performance improvements, docs, or sharing your own skills on the [Skill Hub](https://skills.onyxagent.ai/submit). See [CONTRIBUTING.md](/CONTRIBUTING.md) to get started, then open an Issue to discuss or send a PR directly.

⭐ Star the project to show your support, and Watch → Custom → Releases to get notified of new versions. PRs and Issues are always welcome.

## 🌟 Contributors

![onyx contributors](https://contrib.rocks/image?repo=zhayujie/OnyxAgent&max=1000)

<br/>

## ⚠️ Disclaimer

1. This project is licensed under the [MIT License](/LICENSE) and is intended for technical research and learning. You are responsible for complying with applicable laws and regulations in your jurisdiction; the maintainers assume no liability for any consequences arising from use of this project.
2. **Cost & safety:** Agent mode consumes substantially more tokens than regular chat — pick models that balance quality and cost. The Agent has access to your local operating system, so only deploy it in trusted environments.
3. OnyxAgent is a pure open-source project and does not participate in, authorize, or issue any cryptocurrency.

<br/>

## 📌 Project Renaming Notice

This project was previously named `chatgpt-on-wechat` and is now officially **OnyxAgent**. The old GitHub URL redirects automatically; existing users may optionally run `git remote set-url origin https://github.com/zhayujie/OnyxAgent.git` to update the local remote.
