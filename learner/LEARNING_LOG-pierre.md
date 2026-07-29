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
- I can diagnose one failure in this area: not yet
- Confidence from 1-5: 4
