# 4. Setup and deployment

> **Status:** planned setup for the chosen stack: Next.js + Prisma + PostgreSQL, self-hosted on a VPS with Docker
> (see [Architecture](03-architecture.md#technology-stack)). The app hasn't been scaffolded yet. When it is, check each
> command against the real project, and fill in each _TBD_. That's the job of the "Deploy the system" card.

## Environments

| Environment | Purpose | URL | Database |
|---|---|---|---|
| Local | Development on each team member's machine | `http://localhost:3000` | Postgres in Docker |
| Production | The deployed system (semester deliverable) | _TBD domain_ (HTTPS via Caddy) | Postgres container on the VPS, with a persistent volume |

## Prerequisites

- Git
- Node.js 20 LTS or newer, and npm
- Docker and Docker Compose (for the local database and for production)

## Local setup

```bash
git clone https://github.com/ollayorbek0833/HackHub.git
cd HackHub
npm install
cp .env.example .env            # then fill in the values below
docker compose up -d db         # local PostgreSQL
npx prisma migrate dev          # create the schema
npm run dev                     # http://localhost:3000
```

Useful commands:

| Command | What it does |
|---|---|
| `npx prisma studio` | Browse the database in a web UI |
| `npx prisma migrate dev --name <change>` | Create a migration after editing `prisma/schema.prisma` |
| `npm test` | Unit tests (Vitest) |
| `npx playwright test` | End-to-end tests |

## Configuration

Configuration is read from environment variables, in `.env` locally and set on the server in production.
`.env` is never committed. `.env.example` lists every variable with placeholder values.

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Prisma connection string | `postgresql://hackhub:hackhub@localhost:5432/hackhub` |
| `AUTH_SECRET` | Signs Auth.js sessions | output of `openssl rand -base64 32` |
| `AUTH_URL` | Public URL of the app | `http://localhost:3000` locally, `https://<domain>` in production |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Credentials for the Postgres container | set per environment |

## Production deployment (VPS + Docker)

The production stack runs as three containers, defined in `docker-compose.prod.yml`:

```
Internet ──443──▶ caddy (reverse proxy, automatic HTTPS) ──▶ app (Next.js, port 3000) ──▶ db (PostgreSQL, volume)
```

- **app** is built from the repo's `Dockerfile`, using Next.js `output: "standalone"` to keep the image small.
- **db** keeps its data in a named volume, so it survives restarts and redeploys.
- **caddy** gets and renews the TLS certificate for the domain automatically.

### First-time server setup

1. Get a VPS (_TBD provider_) and point the domain's DNS A record at it.
2. Install Docker and the Compose plugin. Open ports 80 and 443 only.
3. Clone the repo on the server and create the production `.env` there. Don't commit it.

### Deploy

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

_TBD:_ automate these steps with a GitHub Actions workflow that SSHes into the VPS and runs them on every push to `main`.

### Backups

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup-$(date +%F).sql
```

Take a backup before every deploy that includes a migration.

## Smoke test after a deploy

- [ ] The home page loads over HTTPS
- [ ] A new user can register and log in
- [ ] The events list loads
- [ ] An organizer can open the organizer area
- [ ] `docker compose -f docker-compose.prod.yml logs app` shows no errors
