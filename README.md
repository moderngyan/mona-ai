# Nebula AI - Modular Multi-Tenant AI SaaS Platform

Nebula AI is a production-grade AI platform built with Laravel 12 and React. It features a modular architecture, multi-tenancy support, and a pluggable AI provider system.

## 🚀 Key Features

- **Multi-Tenancy**: Complete data isolation using `tenant_id` scoping and custom middleware.
- **AI Core**: Pluggable provider system supporting local LLMs (Ollama) and cloud APIs (OpenAI).
- **Nexus Chat**: Cinematic, glassmorphic chat interface with history management and context window compression.
- **Invoice Engine**: Autonomous invoice parsing and structured data extraction.
- **Usage-Based Billing**: Token tracking and monthly quota enforcement per tenant.
- **Admin Command Center**: Global platform statistics and revenue oversight.

## 🛠 Tech Stack

- **Backend**: Laravel 12 (PHP 8.3)
- **Frontend**: React 18, Vite, Tailwind CSS 4
- **Auth**: Laravel Sanctum (Token-based)
- **Cache/Queue**: Redis
- **Database**: MySQL (optimized for multi-tenancy)
- **Containerization**: Docker & Docker Compose

## 📦 Installation (Docker)

1. Clone the repository and navigate to the root directory.
2. Initialize environment:
    ```bash
    cp .env.example .env
    ```
3. Build and start containers:
    ```bash
    docker-compose up -d --build
    ```
4. Run migrations and seeders:
    ```bash
    docker-compose exec app php artisan migrate --seed
    ```

## 🔐 Credentials (Default)

- **Super Admin**: `admin@nebula.ai` / `password`
- **Standard User**: `user@nebula.ai` / `password`

## 🧠 AI Providers

Configure your providers in `.env`:

- `OLLAMA_BASE_URL`: Defaults to `http://ollama:11434` for Docker.
- `OPENAI_API_KEY`: Add for cloud provider support.

---

_Built with ❤️ by the Advanced Agentic Coding team._
