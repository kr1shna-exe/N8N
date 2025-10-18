FROM python:3.11-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apt-get update && apt-get install -y \
  git \
  curl \
  build-essential \
  wget \
  && wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  && dpkg -i cloudflared-linux-amd64.deb \
  && rm cloudflared-linux-amd64.deb \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:$PATH"

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-install-project --no-dev

COPY . .

RUN uv sync --frozen --no-dev

EXPOSE 8000

COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
