# Aganitha Standard Stack — uv + Python

This project uses the Aganitha standard Python stack. Do not substitute packages.

## Stack

| Concern | Package |
|---|---|
| Package manager | uv |
| Runtime | Python 3.12+ |
| Structured logs | structlog |
| Config | pydantic-settings |
| AI | openai SDK (OpenAI-compatible, provider-neutral) |

> Internal Python packages will be documented here when available.

---

## uv

Always use `uv` — not pip, poetry, or conda.

```bash
uv add <package>     # add a dependency
uv remove <package>  # remove a dependency
uv run <script>      # run in project environment
uv sync              # sync to lockfile
```

---

## structlog

```python
import structlog

log = structlog.get_logger(__name__)
log.info("event.name", key="value")
```

Structured key=value pairs only — no f-string messages. Use `ConsoleRenderer` in development, `JSONRenderer` in production.

---

## pydantic-settings

```python
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    port: int = 8000
    log_level: str = "info"
    database_url: str = Field(..., env="DATABASE_URL")
    model_config = {"env_file": ".env"}

settings = Settings()
```

Use `Field(...)` for required values — app will not start if they are missing.

---

## AI — openai SDK

The `openai` package works with any OpenAI-compatible provider — use whichever the project requires via `base_url`.

```python
from openai import OpenAI

client = OpenAI()  # reads OPENAI_API_KEY and OPENAI_BASE_URL from env

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "..."}],
)
print(response.choices[0].message.content)
```

Set `OPENAI_BASE_URL` to point at a different provider (Azure, Groq, local Ollama, etc.) without changing code.
