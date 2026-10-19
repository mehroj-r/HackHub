# 4. Setup and deployment

> **Status:** skeleton. The commands depend on the technology stack, which hasn't been chosen yet (see
> [Architecture](03-architecture.md#technology-stack)). The "Deploy the system" card fills in each _TBD_.
> The structure and requirements below are already fixed.

## Environments

| Environment | Purpose | URL | Database |
|---|---|---|---|
| Local | Development on each team member's machine | `http://localhost:<port>` | Local database |
| Production | The deployed system (semester deliverable) | _TBD_ (public, HTTPS) | Production database |

## Prerequisites

- Git
- _TBD: runtime and package manager for the chosen stack_
- _TBD: database server, or a Docker setup for it_

## Local setup

```bash
git clone https://github.com/ollayorbek0833/HackHub.git
cd HackHub
# TBD: install dependencies
# TBD: copy the example config, e.g. cp .env.example .env
# TBD: create the database and run migrations
# TBD: start the backend and the frontend
```

## Configuration

Configuration is read from environment variables. Secrets are never committed to the repository.

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Database connection | _TBD_ |
| `SECRET_KEY` | Signing sessions or tokens | generated, kept secret |
| `APP_URL` | Public URL of the app | _TBD_ |

## Deployment

Requirements for the production deploy (from the "Deploy the system" card):

1. Hosting chosen for the app and the database.
2. Production environment configured, with secrets set on the host rather than in the repo.
3. A deploy script or CI pipeline. A deploy is one command or one push.
4. Production database created and migrations run.
5. Public URL with HTTPS.
6. Smoke test after every deploy (see below).
7. Final release deploy at the end of the semester.

```bash
# TBD: deploy command or pipeline trigger
```

## Smoke test after a deploy

- [ ] The home page loads over HTTPS
- [ ] A new user can register and log in
- [ ] The events list loads
- [ ] An organizer can open the organizer area
- [ ] There are no errors in the server logs
