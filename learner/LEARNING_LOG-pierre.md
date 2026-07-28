# Learning log

Create a personal copy. Update it at least once per work session and before every pull request.

## Learner

- Name:
- Cohort:
- Start date:
- Mentor:
- Primary operating system:
- Prior backend experience:
- Prior frontend experience:
- Prior Docker/cloud experience:

---

## Module entry template

### Module NN — title

**Date and branch**

- Date:
- Branch:
- Pull request:

**Objectives in my own words**

Explain what capability this module is building and why a production team needs it.

**Work completed**

Describe the behavior, tests, documentation, and operating changes—not merely the filenames.

**Commands and evidence**

```text
Paste the important commands and concise outputs.
```

**Failure investigated**

- Symptom:
- Smallest reproduction:
- Hypothesis:
- Evidence that confirmed or rejected it:
- Root cause:
- Prevention or test added:

**Decision and tradeoff**

State one decision, an alternative, and why the chosen option fits this context.

**Security, privacy, and operations**

What input, authorization, secret, data, log, migration, cost, or rollback concern did this work introduce?

**Review feedback**

What changed because of review? What principle can be reused later?

**Remaining uncertainty**

Write a precise question or topic to revisit.

**Self-rating**

- I can repeat this with notes: yes / not yet
- I can explain it without the reference code: yes / not yet
- I can diagnose one failure in this area: yes / not yet
- Confidence from 1–5:

---

## Weekly synthesis template

### Week N

- Most important capability gained:
- Hardest failure and how it was diagnosed:
- Strongest evidence produced:
- Repeated mistake or risk pattern:
- One concept I can now teach another learner:
- One objective for next week:

---

## Current module entry

### Module 00 - Orientation and definition of done

**Date and branch**

- Date: 2026-07-28
- Branch: learning/00-orientation
- Pull request: not opened yet

**Objectives in my own words**

Understand the full product journey and architecture, then define done using repeatable evidence instead of visual checks or assumptions.

**Work completed**

Reviewed repository structure and core docs, mapped browser/Nuxt/FastAPI/PostgreSQL/Google Cloud boundaries, and translated the module definition of done into concrete proof methods with commands and pass criteria.

**Commands and evidence**

```text
Repository exploration
- Get-ChildItem -Recurse -Depth 2 -File | Select-Object -First 160

Core documentation reviewed
- README.md
- COURSE_MAP.md
- docs/architecture.md
- learner/FINAL_DEMO.md

Definition-of-done evidence prepared for:
- clean machine startup and health checks
- authorization boundary (user isolation)
- reproducible migrations
- SSR HTML presence for public content
- PR merge blocking on failed checks
- cloud rollback to known-good revision
```

**Failure investigated**

- Symptom: Linux-style command from module instructions failed in PowerShell (head not found).
- Smallest reproduction: find . -maxdepth 2 -type f | sort | head -160
- Hypothesis: shell mismatch between bash instructions and Windows PowerShell.
- Evidence that confirmed or rejected it: PowerShell reported CommandNotFoundException for head.
- Root cause: command sequence assumed Unix utilities not present in default PowerShell.
- Prevention or test added: used PowerShell-native listing command with equivalent outcome.

**Decision and tradeoff**

Decision: use repository-native evidence commands and documented gates as the baseline definition of done. Alternative: keep evidence statements generic. Chosen approach is better because it is measurable, reviewable, and reproducible by mentor and CI.

**Security, privacy, and operations**

Main concerns identified: proving authorization boundaries, avoiding secret leakage in logs and CI, and validating rollback behavior when schema changes may not be backward compatible.

**Review feedback**

Pending mentor review.

**Remaining uncertainty**

Need to validate the exact branch protection configuration used by the mentor organization to prove failed pull requests cannot merge.

**Self-rating**

- I can repeat this with notes: yes
- I can explain it without the reference code: not yet
- I can diagnose one failure in this area: yes
- Confidence from 1-5: 3

---

## Current module entry

### Module 01 - Workstation and repository setup

**Date and branch**

- Date: 2026-07-28
- Branch: learning/01-setup
- Pull request: not opened yet

**Objectives in my own words**

Prove this workstation can run the workshop stack reproducibly and capture exact tool/runtime evidence, including one diagnosed setup failure.

**Work completed**

Verified local tool versions and system context, validated repository safety boundaries, and created local `.env` using the provided setup helper through Git Bash on Windows.

**Commands and evidence**

```text
Tool versions
- git --version => 2.47.1.windows.2
- docker --version => 28.4.0
- docker compose version => v2.39.2-desktop.1
- cmd /c ver => Windows 10.0.26200.8875

Future cloud tools
- gcloud --version => not installed
- terraform version => not installed
- gh --version => not installed

System context
- CPU: 11th Gen Intel Core i7-1165G7 (4 cores / 8 logical processors)
- Docker allocation: CPUs=8 MemTotal=6094344192 (~6.09 GB)

Safety boundary checks
- git remote -v confirmed origin and upstream
- git check-ignore -v .env => ignored by .gitignore rule
- .gitignore contains .env and dev artifacts
- .dockerignore excludes build/runtime context files for image builds

Setup helper
- "C:\Program Files\Git\bin\bash.exe" ./scripts/setup.sh
- Output confirmed .env creation and prerequisite checks
```

**Failure investigated**

- Symptom: `make setup` failed.
- Smallest reproduction: make setup
- Hypothesis: make is missing in this PowerShell environment.
- Evidence that confirmed or rejected it: PowerShell CommandNotFoundException for `make`.
- Root cause: module commands assume Unix toolchain not installed in this shell.
- Prevention or test added: use direct commands and run setup helper via Git Bash path.

**Decision and tradeoff**

Decision: execute setup through `scripts/setup.sh` using Git Bash instead of installing make first. Alternative: pause to install make immediately. Chosen path unblocked current module quickly while preserving reproducible behavior.

**Security, privacy, and operations**

`.env` was created locally and remains Git-ignored. No secret values were copied into tracked files or logs.

**Review feedback**

Pending mentor review.

Step 5 — Runtime identity and containerization evidence
```text
docker compose exec backend whoami
=> app (non-root user, correctly configured)

docker compose exec frontend whoami
=> root (development only; production will differ)

docker compose exec backend python --version
=> Python 3.13.5

docker compose exec frontend node --version
=> v22.16.0
```

Step 6 — Database outage drill (liveness vs. readiness)
```text
docker compose stop db

curl -i http://localhost:8000/health/live
=> HTTP/1.1 200 OK
=> {"status":"alive"}
(PROOF: liveness checks process only, not dependencies)

curl -i http://localhost:8000/health/ready
=> HTTP/1.1 503 Service Unavailable
=> {"detail":"database unavailable"}
(PROOF: readiness fails when critical dependency (DB) is unavailable)

docker compose start db
docker compose ps
=> All three services show healthy

curl -i http://localhost:8000/health/ready
=> HTTP/1.1 200 OK
=> {"status":"ready"}
(PROOF: service recovers when DB becomes available again)
```

Step 7 — Clean shutdown and volume persistence
```text
docker compose down
=> [+] Running 4/4
 ✔ Container fullstack-intern-starter-frontend-1  Removed
 ✔ Container fullstack-intern-starter-backend-1   Removed
 ✔ Container fullstack-intern-starter-db-1        Removed
 ✔ Network fullstack-intern-starter_default       Removed

docker volume ls | findstr "postgres"
=> local     fullstack-intern-starter_starter-postgres-data
(PROOF: named volume persists after 'docker compose down')
(containers and network removed, but data volume preserved for recovery)
```

**Failure investigated**

Second failure from Step 4 (not yet recorded):
- Symptom: Frontend build failed with "Cannot read properties of null (reading 'edgesOut')".
- Smallest reproduction: docker compose build frontend
- Hypothesis: npm 10.9.2 dependency resolver fails on Alpine Linux with certain Nuxt transitive dependencies.
- Evidence that confirmed or rejected it: exact npm error in dependency resolution; npm install works on macOS/Linux but fails in Alpine container.
- Root cause: npm resolver encounters edge case bug when building dependency graph for Nuxt/Vue packages in minimal Alpine environment.
- Prevention or test added: Changed frontend/Dockerfile to use `npm ci` (lockfile-driven deterministic install) instead of `npm install` (resolver-based). Tested: `docker compose build --no-cache frontend` then `docker compose up -d` — succeeded.

**Decision and tradeoff**

Decision: Modify Dockerfile to use `npm ci` with package-lock.json for container builds. Alternative: wait for npm fix or use different base image. Chosen approach maintains build reproducibility and is standard practice for CI/containers; lockfile-driven installs avoid resolver bugs entirely.

**Security, privacy, and operations**

- Backend container runs as unprivileged user "app" (UID gid confirmation).
- Frontend container runs as root in development mode (noted as development-only; production differs).
- Health endpoints properly distinguish between "live" (process running) and "ready" (dependencies available).
- Database volume persists across container lifecycle; `down -v` would be needed to delete it (important for data safety).
- All three services start and synchronize automatically; no manual orchestration needed.

**Review feedback**

Pending mentor review.

**Remaining uncertainty**

Need to validate that modified frontend/Dockerfile is correct per project standards, and confirm that npm ci is the intended approach for container builds vs. npm install.

**Self-rating**

- I can repeat this with notes: yes
- I can explain it without the reference code: yes
- I can diagnose one failure in this area: yes
- Confidence from 1-5: 5
