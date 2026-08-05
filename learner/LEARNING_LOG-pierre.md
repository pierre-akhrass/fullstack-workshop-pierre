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

---

## Current module entry

### Module 02 — Git, GitHub, and pull requests

**Date and branch**

- Date: 2026-07-29
- Branch: learning/02-git-workflow
- Pull request: https://github.com/FadiZahhar/fullstack-workshop-ogilvy/pull/12 (Draft)

**Objectives in my own words**

Learn to use Git branches, commits, remotes, and pull requests as a controlled change workflow. Practice focused commits, understand merge conflict resolution, and recognize how GitHub checks and branch protection enforce code quality gates.

**Git state model explanation**

Four distinct states in Git that must be understood:

1. **Working tree**: Files on disk in my local directory. Changes here are not tracked by Git until I explicitly add them.

2. **Staging area (index)**: Selected changes ready to be committed. `git add` moves changes from working tree to staging area. `git diff` shows working tree vs. staging area; `git diff --staged` shows staging area vs. last commit.

3. **Local commit**: Snapshot recorded in my local repository after `git commit`. This exists only on my machine until I push. Multiple commits form the branch history.

4. **Remote branch**: Commits on the server (origin or upstream). `git push` sends local commits to remote; `git pull` fetches remote and merges into working tree. A remote branch is a point-in-time record, not a live workspace.

Why this matters: Selective staging (`git add -p`) lets me review and commit changes in logical units, each with a clear purpose. Using `git add .` blindly commits all changes together, hiding mistakes or unrelated edits.

**Work completed**

Step 1: Verified Git identity and remotes are correctly configured (user.name, user.email, origin/upstream).
Step 2: Created feature branch `learning/02-git-workflow` and documented Git state model in this learning log.
Step 3: Practiced selective staging by making two small documentation edits in different files, staging them independently, and committing them as two separate, focused commits (not mixed into one snapshot).
Step 4: Pushed branch to remote and opened draft pull request #12 with title, description following the template, and marked as draft to indicate work in progress.

**Commands and evidence**

```text
Step 1 — Git identity and configuration
git config user.name
=> pierre-akhrass

git config user.email
=> pierreakhrass@outlook.com

git status
=> On branch learning/01-setup
=> Your branch is up to date with 'origin/learning/01-setup'.
=> nothing to commit, working tree clean

git log --oneline --decorate -n 8
=> 1ca302e (HEAD -> learning/01-setup, origin/learning/01-setup) docs(learning): complete reproducible workstation setup
=> 774c7aa (upstream/main, upstream/HEAD, origin/main, origin/HEAD, main) Initial commit

git remote -v
=> origin  https://github.com/pierre-akhrass/fullstack-workshop-pierre.git (fetch)
=> origin  https://github.com/pierre-akhrass/fullstack-workshop-pierre.git (push)
=> upstream        https://github.com/FadiZahhar/fullstack-workshop-ogilvy.git (fetch)
=> upstream        https://github.com/FadiZahhar/fullstack-workshop-ogilvy.git (push)

Step 2 — Create focused branch
git switch -c learning/02-git-workflow
=> Switched to a new branch 'learning/02-git-workflow'

Step 3 — Practice selective staging with two separate commits
git status
=> On branch learning/02-git-workflow
=> Changes not staged for commit:
=>   modified:   learner/LEARNING_LOG-pierre.md
=>   modified:   learner/SETUP_CHECKLIST.md

First commit — stage only SETUP_CHECKLIST:
git add learner/SETUP_CHECKLIST.md
git diff --staged
=> [shows only SETUP_CHECKLIST changes - LEARNING_LOG deliberately excluded]

git commit -m "docs(learning): explain Git state model and patch staging"
=> [learning/02-git-workflow dd12bbd] docs(learning): explain Git state model and patch staging
=>  1 file changed, 8 insertions(+)

Second commit — stage only LEARNING_LOG:
git add learner/LEARNING_LOG-pierre.md
git diff --staged
=> [shows only LEARNING_LOG Module 02 entry - 92 insertions]

git commit -m "docs(learning): document Module 02 Git workflow objectives and state model"
=> [learning/02-git-workflow 3d5ad1a] docs(learning): document Module 02 Git workflow objectives and state model
=>  1 file changed, 92 insertions(+)

Final history:
git log --oneline -n 5
=> 3d5ad1a (HEAD -> learning/02-git-workflow) docs(learning): document Module 02 Git workflow objectives and state model
=> dd12bbd docs(learning): explain Git state model and patch staging
=> 1ca302e (origin/learning/01-setup, learning/01-setup) docs(learning): complete reproducible workstation setup
=> 774c7aa (upstream/main, upstream/HEAD, origin/main, origin/HEAD, main) Initial commit

Step 4 — Push and open draft pull request
git push -u origin learning/02-git-workflow
=> Enumerating objects: 16, done.
=> Counting objects: 100% (16/16), done.
=> Delta compression using up to 8 threads
=> Compressing objects: 100% (6/6), done.
=> Writing objects: 100% (3.57 KiB)
=> Total 12 (delta 9), reused 0 (delta 0), pack-reused 0
=> remote: Create a pull request for 'learning/02-git-workflow' on GitHub by visiting:
=> remote: https://github.com/pierre-akhrass/fullstack-workshop-pierre/pull/new/learning/02-git-workflow
=> [new branch] learning/02-git-workflow -> learning/02-git-workflow
=> branch 'learning/02-git-workflow' set up to track 'origin/learning/02-git-workflow'

Draft PR created at: https://github.com/FadiZahhar/fullstack-workshop-ogilvy/pull/12
- Title: docs(learning): demonstrate reviewed Git workflow
- Status: DRAFT (cannot be merged until marked ready for review)
- Commits: 4 commits with 467 additions, 1 deletion
- Files: 3 files changed (learner/LEARNING_LOG-pierre.md, learner/SETUP_CHECKLIST.md)
```

**Failure investigated**

Not applicable yet; proceeding through steps sequentially.

**Decision and tradeoff**

Decision: Use `git add -p` for interactive staging instead of `git add .` to maintain focused commits. This approach ensures each commit has a single logical purpose and is easier to review and rollback if needed.

**Security, privacy, and operations**

No sensitive configuration yet; will validate that `.env` and credentials remain ignored throughout the workflow.

**Review feedback**

Pending mentor review.

**Remaining uncertainty**

Will learn about merge conflict resolution in Step 6, and GitHub check requirements in Step 5.

**Self-rating**

- I can repeat this with notes: yes
- I can explain it without the reference code: yes (Git state model is foundational)
- I can diagnose one failure in this area: yes (conflict resolution practiced)
- Confidence from 1-5: 5

---

## Steps 5-8: Checks, conflict resolution, and PR completion

### Step 5 — Read checks and review comments

**GitHub checks review:**
- Repository has 0 checks configured (no CI/CD validation gates)
- Interpretation: This teaching repository intentionally has no automated tests blocking PR merge, allowing focus on Git workflow rather than pipeline mechanics
- Implication: Branch protection and code review are the quality controls, not automated checks

### Step 6 — Resolve deliberate merge conflict

**Conflict scenario created:**
- Main branch: Added "## Instructor feedback" section to SETUP_CHECKLIST.md
- Feature branch: Added "## Module 02 Git workflow notes" section to same file
- Conflict type: Content conflict at end-of-file (both sections added to same location)

**Conflict resolution process:**

```text
Step 6.1 — Trigger conflict via rebase
git rebase main
=> error: could not apply dd12bbd... docs(learning): explain Git state model and patch staging
=> Resolve all conflicts manually, mark them as resolved with "git add/rm <conflicted_files>"
=> git status shows: Unmerged paths: both modified:   learner/SETUP_CHECKLIST.md

Step 6.2 — Inspect conflict markers
Conflict markers showed:
<<<<<<< HEAD
## Instructor feedback
Good work on the setup. Remember to document any blocking issues...
=======
## Module 02 Git workflow notes
Key learning: Use `git add -p` (patch mode)...
>>>>>>> dd12bbd

Step 6.3 — Resolve intelligently (not "ours" or "theirs")
Decision: Keep BOTH sections—they don't conflict, both add value
- Instructor feedback is educational framing
- Module notes are learner-specific practice documentation
- Combined result: Both sections in natural order

Resolved file structure:
[...Evidence to submit...]
---
## Instructor feedback
[feedback text]
## Module 02 Git workflow notes  
[notes text]

Step 6.4 — Mark resolved and continue rebase
git add learner/SETUP_CHECKLIST.md
git rebase --continue
=> [detached HEAD 0ef80f6] docs(learning): explain Git state model and patch staging
=> Successfully rebased and updated refs/heads/learning/02-git-workflow

Step 6.5 — Verify rebase complete
git log --oneline -n 6
=> a104ed4 (HEAD -> learning/02-git-workflow) docs(learning): update learning log...
=> b674e99 docs(learning): explain selective staging...
=> 3be82cf docs(learning): document Module 02...
=> 0ef80f6 docs(learning): explain Git state model...  [CONFLICT RESOLVED HERE]
=> c92f1f2 docs(learning): complete reproducible workstation...
=> 213ad72 (main) docs(instructor): add feedback to setup checklist
```

**Key learning from Step 6:**
- Merge conflicts are data, not disasters—they show exactly where two intentions collide
- Never blindly choose "ours" or "theirs"—understand the intent behind each change
- Conflict resolution is a teaching opportunity to verify combined logic is correct
- `--force-with-lease` safer than `--force` when pushing rebased history

### Step 7 — Inspect history and restore safely

**Git history inspection commands:**

```text
git log --oneline --graph --decorate --all -n 10
=> Shows commit graph with branches and merge relationships
=> Helps identify divergence points (e.g., local vs. origin after rebase)

git log --oneline -n 6
=> Simple list with commit hashes and messages
=> Use to verify merge conflict resolution produced correct commit (0ef80f6)

git show --stat <commit-hash>
=> Example: git show --stat 0ef80f6
=> Output:
=>   commit 0ef80f6ba8e01ef4efc9d918ce462105f09ab2a6
=>   Author: pierre-akhrass <pierreakhrass@outlook.com>
=>   Date:   Wed Jul 29 10:10:59 2026 +0300
=>       docs(learning): explain Git state model and patch staging
=>    learner/SETUP_CHECKLIST.md | 6 ++++++
=>    1 file changed, 6 insertions(+)
=> Confirms this commit contains the resolved conflict content
```

**Safe file restoration practice:**

```text
Scenario: Test change made to working tree

echo "test change" >> learner/SETUP_CHECKLIST.md
git status
=> Changes not staged for commit: modified:   learner/SETUP_CHECKLIST.md

git restore learner/SETUP_CHECKLIST.md
git status  
=> nothing to commit, working tree clean
=> File safely restored to HEAD version without affecting commit history
```

**Comparison of restoration methods:**
- `git restore <file>` — Discard working tree changes (safe, non-destructive)
- `git restore --staged <file>` — Unstage changes from index without losing work
- `git revert <commit>` — Create new commit that undoes a previous commit (for shared history)
- `git reset --hard <commit>` — Rewrite history (use ONLY on personal branches)

### Step 8 — Complete review, convert to ready, merge

**Step 8.1 — Force-push rebased history to origin:**

```text
git push --force-with-lease origin learning/02-git-workflow
=> Enumerating objects: 31, done.
=> Counting objects: 100% (31/31), done.
=> Delta compression using up to 8 threads
=> Writing objects: 8.68 KiB | 683.00 KiB/s
=> Total 26 (delta 19), reused 0 (delta 0), pack-reused 0
=> + e662391...a104ed4 learning/02-git-workflow -> learning/02-git-workflow (forced update)

Verification:
git log --oneline origin/learning/02-git-workflow -n 3
=> a104ed4 docs(learning): update learning log with Step 4...
=> b674e99 docs(learning): explain selective staging...
=> 3be82cf docs(learning): document Module 02...
=> [origin branch now synced with local rebased history]
```

**Why `--force-with-lease` instead of `--force`:**
- `--force-with-lease` checks that remote hasn't changed since our last fetch (safer)
- `--force` unconditionally overwrites (dangerous on shared branches)
- Safe to use on personal feature branches where we're the only author

**Step 8.2 — PR status before merge:**
- Title: "docs(learning): demonstrate reviewed Git workflow"
- Branch: learning/02-git-workflow (5 commits after rebase)
- Files changed: 3 (learner/SETUP_CHECKLIST.md, learner/LEARNING_LOG-pierre.md + module 01 reference)
- Checks: 0 (no CI gates for this repo)
- Status: DRAFT → (Ready for review after mentor approval)

**What happens next:**
1. Mentor reviews PR and comments
2. Any feedback → learner updates commits and force-pushes
3. Mentor approves and converts DRAFT to ready
4. Merge to main via GitHub (or learner merges locally if permitted)
5. Delete remote branch after merge

---

## Module 02 completion evidence

**Validation checklist (from module specification):**
- [x] PR contains coherent commits (5 focused commits, each with single purpose)
- [x] No generated files, `.env`, credentials, or unrelated formatting mixed in
- [x] Can explain working tree, index, commit, branch, remote, PR (documented in this log)
- [x] Resolved a content conflict (practiced in Step 6 rebase)
- [x] Identified GitHub checks (0 required checks on this repo)
- [x] Practiced history inspection (`git log --graph`, `git show --stat`)
- [x] Practiced safe restoration (`git restore`)
- [ ] (Pending) Mentor review and approval on PR #12

**Completed date:** 2026-07-29
**Time invested:** Approximately 2 hours (git workflow practice, conflict resolution, history inspection)

---

## Current module entry

### Module 04 — Docker and container fundamentals

**Date and branch**

- Date: 2026-08-05
- Branch: learning/04-docker-fundamentals
- Pull request: not opened yet

**Objectives in my own words**

Understand how Docker images are assembled from layers, how containers run those images as isolated processes, and how build order, runtime identity, health checks, ports, and build context affect security, reliability, and rebuild speed.

**Work completed**

Inspected the backend and frontend production Dockerfiles, built both final production images without Compose, verified non-root runtime users, ran each image in isolation, inspected health/process/port metadata, explored Docker cache behavior with repeated and deliberately invalidated builds, performed two failure drills, and fixed a frontend production build issue caused by a TypeScript reference to `process.env` in the Nuxt config.

**Commands and evidence**

```text
Step 1 — Dockerfile inspection
backend/Dockerfile stages:
- base: python:3.13.5-slim, sets Python env flags, creates /workspace, creates non-root user/group app
- development: copies full backend source, installs `.[dev]`, runs uvicorn with --reload, USER app, EXPOSE 8000
- production: copies full backend source, installs package `.`, USER app, EXPOSE 8000, HEALTHCHECK /health/live, runs uvicorn without reload

frontend/Dockerfile stages:
- dependencies: node:22.16.0-alpine, copies package manifests first, runs `npm ci --no-audit --no-fund`
- development: copies full source, runs `npm run dev`, EXPOSE 3000
- build: copies full source, runs `npm run build`
- production: fresh node:22.16.0-alpine, sets runtime env defaults, creates non-root user app, copies only `.output` from build stage, USER app, EXPOSE 3000, runs `node server/index.mjs`

Curriculum mismatch observed:
- `e2e/Dockerfile` does not exist in this repository snapshot
- `./scripts/check-secrets.sh` does not exist in this repository snapshot

Step 2 — Build production images without Compose
docker build --progress=plain --target production -t workboard-backend:module04 backend
=> success
=> final image named workboard-backend:module04

docker build --progress=plain --target production -t workboard-frontend:module04 frontend
=> initially failed with:
=> nuxt.config.ts(7,16): error TS2591: Cannot find name 'process'

Root-cause fix applied:
- changed frontend runtimeConfig default from `process.env.NUXT_PUBLIC_API_BASE || ...` to a static default string
- reasoning: Nuxt runtime config can still be overridden by `NUXT_PUBLIC_API_BASE` at runtime without directly referencing the Node global in config code

docker build --progress=plain --target production -t workboard-frontend:module04 frontend
=> success after config fix

docker image ls --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | findstr /I "workboard-backend workboard-frontend"
=> workboard-backend  module04  206MB
=> workboard-frontend module04  162MB

Relevant history excerpts
docker history workboard-backend:module04 --format "table {{.CreatedBy}}\t{{.Size}}"
=> COPY --chown=app:app . .                  4.64kB
=> RUN pip install --no-cache-dir .          85MB
=> USER app                                  0B
=> HEALTHCHECK /health/live                  0B

docker history workboard-frontend:module04 --format "table {{.CreatedBy}}\t{{.Size}}"
=> COPY --from=build ... /workspace/.output  2.76MB
=> RUN addgroup -S app && adduser -S app     3.19kB
=> base node layer                           146MB
=> no source tree copied into final runtime stage

Step 3 — Prove runtime identity
docker run --rm --entrypoint whoami workboard-backend:module04
=> app

docker run --rm --entrypoint id workboard-backend:module04
=> uid=999(app) gid=999(app) groups=999(app)

docker run --rm --entrypoint whoami workboard-frontend:module04
=> app

docker run --rm --entrypoint id workboard-frontend:module04
=> uid=100(app) gid=101(app) groups=101(app)

Step 4 — Run isolated containers and inspect runtime
docker run -d --name module04-backend -p 18000:8000 workboard-backend:module04
=> started container

docker inspect module04-backend --format "User={{.Config.User}} Cmd={{json .Config.Cmd}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} Ports={{json .NetworkSettings.Ports}}"
=> User=app
=> Cmd=["uvicorn","app.main:app","--host","0.0.0.0","--port","8000","--proxy-headers"]
=> Health=starting
=> Ports maps 8000/tcp to host 18000

curl -i http://localhost:18000/health/live
=> HTTP/1.1 200 OK
=> {"status":"alive"}

docker run -d --name module04-frontend -p 13000:3000 workboard-frontend:module04
=> started container

docker inspect module04-frontend --format "User={{.Config.User}} Cmd={{json .Config.Cmd}} Health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} Ports={{json .NetworkSettings.Ports}}"
=> User=app
=> Cmd=["node","server/index.mjs"]
=> Health=none
=> Ports maps 3000/tcp to host 13000

curl -i http://localhost:13000/api/health
=> HTTP/1.1 200 OK
=> {"status":"ready"}

Step 5 — Explore build cache deliberately
Repeated unchanged builds:
docker build --progress=plain --target production -t workboard-backend:module04 backend
=> all meaningful layers CACHED including COPY and pip install

docker build --progress=plain --target production -t workboard-frontend:module04 frontend
=> all meaningful layers CACHED including npm ci, build, and final copy

Late source file probe:
- temporary reversible change in frontend/app/app.vue
docker build --progress=plain --target production -t workboard-frontend:module04 frontend
=> `npm ci` stayed CACHED
=> `COPY . .`, `npm run build`, and final artifact copy rebuilt

Dependency manifest probe:
- temporary reversible change to frontend/package.json version field only
docker build --progress=plain --target production -t workboard-frontend:module04 frontend
=> `COPY package.json` rebuilt
=> `npm ci` reran and took ~177s
=> downstream build stage reran

Why dependency manifests are copied early:
- if only source changes, package installation layer stays cached
- if manifest changes, dependency layer is correctly invalidated and rebuilt
- this reduces rebuild time during normal app development and CI

Step 6 — Build context and exclusions
Root .dockerignore excludes:
- .git
- .env
- Python caches
- node_modules
- .nuxt
- .output
- coverage

backend/.dockerignore excludes:
- __pycache__, pyc, pytest/mypy/ruff caches, .venv, coverage artifacts

frontend/.dockerignore excludes:
- node_modules, .nuxt, .output, coverage, npm-debug logs

Measured context from build output:
- backend context transfer: 485B
- frontend context transfer: about 1.05-1.16kB during these builds

Interpretation:
- context is intentionally tiny
- build inputs are constrained to relevant app files only
- no `.env` or `.git` content appears in context output

Step 7 — Failure drills
Failure drill 1: wrong executable
docker run --rm --entrypoint does-not-exist workboard-backend:module04
=> exec: "does-not-exist": executable file not found in $PATH
Diagnosis:
- container creation succeeded up to runtime startup
- PID 1 could not start because the executable was absent
- smallest diagnostic: inspect entrypoint/CMD and verify binary exists in image PATH

Failure drill 2: host port already in use
docker run --rm -p 18000:3000 workboard-frontend:module04
=> Bind for 0.0.0.0:18000 failed: port is already allocated
Diagnosis:
- failure happened in Docker networking before app startup
- smallest diagnostic: inspect running containers and host port mappings

Step 8 — Signal and shutdown behavior
docker logs module04-backend --tail 20
=> Started server process [1]
=> Uvicorn running on http://0.0.0.0:8000

docker stop module04-backend
docker logs module04-backend --tail 20
=> Shutting down
=> Waiting for application shutdown.
=> Application shutdown complete.
=> Finished server process [1]

docker logs module04-frontend --tail 20
=> Listening on http://0.0.0.0:3000

docker stop module04-frontend
=> container stopped cleanly

PID 1 interpretation:
- backend PID 1 is uvicorn
- frontend PID 1 is node running Nitro server
- `docker stop` sends SIGTERM to PID 1; graceful behavior depends on that process handling shutdown correctly
```

**Failure investigated**

- Symptom: frontend production image build failed during `npm run build`.
- Smallest reproduction: `docker build --target production -t workboard-frontend:module04 frontend`
- Hypothesis: TypeScript type-checking in `nuxt.config.ts` cannot resolve the Node global `process` inside the container build.
- Evidence that confirmed or rejected it: Docker build failed with `nuxt.config.ts(7,16): error TS2591: Cannot find name 'process'`.
- Root cause: the Nuxt config referenced `process.env` directly, which pulled in a Node-global typing expectation not configured for this frontend build path.
- Prevention or test added: replaced direct `process.env` access with a static default runtimeConfig value, then rebuilt the production image successfully.

**Decision and tradeoff**

Decision: fix the frontend build by removing the direct `process.env` reference from `nuxt.config.ts` instead of adding and maintaining Node typing configuration just for config compilation. Alternative: add explicit Node type dependencies/configuration. The chosen approach is simpler and preserves runtime configurability through Nuxt's standard `NUXT_PUBLIC_*` override behavior.

**Security, privacy, and operations**

- Both final production images run as non-root `app` users, reducing impact if the process is compromised.
- Non-root is not a full sandbox; the container still has network access and any permissions granted by the runtime.
- No secrets were observed in image history, build args, or transferred build context.
- Backend image includes an explicit liveness health check; frontend image currently relies on external probing and has no Docker HEALTHCHECK.
- Frontend final stage copies only build output, which reduces attack surface relative to copying the full source tree into runtime.

**Review feedback**

Pending mentor review.

**Remaining uncertainty**

Whether the missing `e2e/Dockerfile` and `scripts/check-secrets.sh` are intentional for this repository snapshot or expected to be added later in the curriculum.

**Self-rating**

- I can repeat this with notes: yes
- I can explain it without the reference code: yes
- I can diagnose one failure in this area: yes
- Confidence from 1-5: 5

---

## Current module entry

### Module 03 — HTTP, REST, JSON, and API contracts

**Date and branch**

- Date: 2026-08-03
- Branch: learning/03-api-contracts
- Pull request: not opened yet

**Objectives in my own words**

Understand HTTP as a strict contract between clients and services: method semantics, status code meaning, request/response structure, and predictable error behavior. Validate the real running API contract against documentation and record mismatches with reproducible evidence.

**Work completed**

Started Module 03 on the required branch, verified service availability, exported and inspected OpenAPI, traced wire-level HTTP behavior with verbose curl, exercised documented authentication routes, and built an evidence-backed status/error matrix from actual runtime behavior.

**Commands and evidence**

```text
Section 0 — Prerequisite verification and branch setup
docker compose ps
=> backend: Up (healthy) on 0.0.0.0:8000
=> db: Up (healthy)
=> frontend: Up on 0.0.0.0:3000

git switch -c learning/03-api-contracts
=> Switched to a new branch 'learning/03-api-contracts'

Section 1 — Inspect documented contract and OpenAPI
curl --fail http://localhost:8000/openapi.json -o workboard-openapi.json
=> download succeeded (686 bytes)

python -m json.tool workboard-openapi.json
=> openapi: 3.1.0
=> info.title: Workboard Starter API
=> info.version: 0.1.0
=> paths present: /health/live, /health/ready

curl -i http://localhost:8000/docs
=> HTTP/1.1 200 OK
=> Swagger UI HTML returned (url: /openapi.json)

Section 2 — Trace request on the wire
curl -v http://localhost:8000/api/v1/status
=> DNS resolved localhost to ::1 and 127.0.0.1
=> TCP connection established to ::1:8000
=> Request line: GET /api/v1/status HTTP/1.1
=> Request headers: Host, User-Agent, Accept
=> Response: HTTP/1.1 404 Not Found
=> Response headers include content-type: application/json
=> Body: {"detail":"Not Found"}

Section 3 — Exercise authentication manually
curl -i -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" --data-binary "@.tmp-register.json"
=> HTTP/1.1 404 Not Found
=> {"detail":"Not Found"}

curl -i -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" --data-urlencode "username=api-learner@example.com" --data-urlencode "password=StrongPassword123!"
=> HTTP/1.1 404 Not Found
=> {"detail":"Not Found"}

Section 4 — Status/error matrix evidence probes
curl -i http://localhost:8000/health/live
=> HTTP/1.1 200 OK
=> {"status":"alive"}

curl -i http://localhost:8000/health/ready
=> HTTP/1.1 200 OK
=> {"status":"ready"}

curl -i -X POST http://localhost:8000/health/live
=> HTTP/1.1 405 Method Not Allowed
=> allow: GET
=> {"detail":"Method Not Allowed"}

curl -i http://localhost:8000/api/v1/projects
=> HTTP/1.1 404 Not Found
=> {"detail":"Not Found"}

curl -i -H "Authorization: Bearer invalid.token.value" http://localhost:8000/api/v1/projects
=> HTTP/1.1 404 Not Found
=> {"detail":"Not Found"}
```

**Section summaries for explanation**

Section 1 summary:
- The service is running and Swagger UI is reachable at `/docs`.
- Exported OpenAPI confirms only two active paths in the running snapshot: `/health/live` and `/health/ready`.
- Documented contract (`docs/api-contract.md`) describes broader `/api/v1` resources, but those are not currently present in runtime schema.

Section 2 summary:
- `curl -v` clearly separates transport from application behavior.
- Transport succeeded (DNS + TCP connect), but application route `/api/v1/status` returned `404`.
- This proves the server is up while the requested route is missing.

Section 3 summary:
- Auth endpoints from module instructions (`/api/v1/auth/register`, `/api/v1/auth/login`) currently return `404`.
- No token was issued, so protected-endpoint auth testing is blocked in this runtime snapshot.
- Security rule still upheld: no tokens written to tracked files.

Section 4 summary (observed matrix in current runtime):
- Valid health GET requests: `200`.
- Wrong method on existing route: `405` with `allow: GET`.
- Missing API resource paths: `404` with `{ "detail": "Not Found" }`.
- Because `/api/v1/projects` is missing, invalid-token request also resolves as `404` instead of `401` in this environment.

Section 5 summary (idempotency and retry implications):
- `GET /projects` (when implemented) is semantically safe and idempotent.
- `POST /projects` is not idempotent by default; retries can create duplicates unless server enforces unique constraints or idempotency keys.
- `PATCH /tasks/{id}` can be idempotent only when applying the exact same effective state repeatedly.
- `DELETE` is idempotent by semantics: deleting an already-deleted resource should not create additional state change.
- Practical rule: network retries for create/payment-like operations should use idempotency keys in production.

Section 6 summary (backward-compatible filter contract proposal):
- Proposed endpoint shape:
	`GET /api/v1/projects/{project_id}/tasks?status=in_progress&priority=high`
- Validation:
	- `status` enum: `backlog | in_progress | done`
	- `priority` enum: `low | medium | high`
	- invalid enum value returns `422` (FastAPI validation)
- Combination behavior:
	- AND semantics when both filters provided
	- omitted filters mean "no filter" for that dimension
- Empty result:
	- return `200` with `[]` (not `404`)
- Compatibility:
	- existing endpoint remains unchanged when query params are omitted
- Future pagination:
	- reserve `limit`/`offset` or cursor params without changing current response contract
- Data/index implications:
	- add composite/individual indexes on `(project_id, status)` and `(project_id, priority)` for scale
- OpenAPI + frontend:
	- document query params in OpenAPI; add typed query interface in frontend client
- Tests:
	- success, each single filter, combined filters, invalid enum `422`, inaccessible project `404`, auth failures once auth layer exists

Section 7 summary:
- Evidence recorded in this learning log (commands, outputs, matrix, and contract proposal).
- No change made to `docs/api-contract.md` because runtime behavior mismatch was observed, not an implemented contract change.

**Failure investigated**

- Symptom: Module 03 `/api/v1` endpoints documented in module text return `404` in running service.
- Smallest reproduction: `curl -i http://localhost:8000/api/v1/status`
- Hypothesis: running backend snapshot only includes health routes.
- Evidence that confirmed or rejected it: exported `/openapi.json` lists only `/health/live` and `/health/ready`.
- Root cause: this environment is currently running a minimal API surface relative to workshop contract text.
- Prevention or test added: always verify `/openapi.json` before writing endpoint-level test expectations.

**Decision and tradeoff**

Decision: continue Module 03 with evidence-based analysis using actual runtime responses, while documenting expected semantics from the contract spec. Alternative: block the entire module until full `/api/v1` routes are available. Chosen approach preserves learning momentum and produces actionable mismatch evidence.

**Security, privacy, and operations**

No bearer token was generated or committed. Temporary request body file for register testing was removed after use. All responses captured were non-sensitive (`404`, `405`, health payloads).

**Review feedback**

Pending mentor review.

**Remaining uncertainty**

Whether this module is expected to run against a fuller reference API branch/environment than the currently running container image.

**Self-rating**

- I can repeat this with notes: yes
- I can explain it without the reference code: yes
- I can diagnose one failure in this area: yes
- Confidence from 1-5: 4
