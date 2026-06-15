# Prerequisites

**Previous:** [../GETTING-STARTED.md](../GETTING-STARTED.md)  
**Next:** [local-setup.md](./local-setup.md)

## Required tools

| Tool                                       | Used by    | Notes                      |
| ------------------------------------------ | ---------- | -------------------------- |
| [Node.js](https://nodejs.org/) **22.22.1** | `apps/web` | `nvm use` at repo root     |
| [Python](https://www.python.org/) 3.12+    | `apps/api` | `apps/api/.python-version` |
| [uv](https://docs.astral.sh/uv/)           | `apps/api` | Python package manager     |
| [Ollama](https://ollama.com)               | `apps/api` | Local LLM runtime          |

Node pinning details: [../tooling/node-version.md](../tooling/node-version.md)

## Ollama model

Pull a model before running the API (must match `OLLAMA_MODEL` in `.env`):

```bash
ollama pull llama3.2
```

Verify Ollama is running:

```bash
curl http://localhost:11434/api/tags
```
